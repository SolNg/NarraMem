/**
 * Behaviour patches applied to the minified bundle, on top of the translation.
 *
 * Each patch anchors on a regular expression whose capture groups pick up the
 * minified identifiers, so a rebuild that renames them still matches. A patch
 * must match exactly once — `localize.mjs` aborts otherwise rather than guess.
 *
 * Identifiers are matched with `[\w$]+`, not `\w+`: esbuild hands out `$` as a
 * variable name once the short pool runs out, and beta.67 renamed a captured
 * binding to exactly that, silently breaking an anchor that looked robust.
 */

/**
 * Drag-to-scroll for the module filter strip.
 *
 * `.narramem-module-tabs` scrolls horizontally but sets `scrollbar-width: none`,
 * so on a desktop the chips past the right edge can only be reached with the
 * keyboard. Touch already pans natively; this adds mouse drag and wheel support.
 * The companion CSS restores a thin scrollbar on fine pointers.
 *
 * A drag ends with a `click` on whichever chip is under the cursor, which would
 * switch category by accident, so a drag that actually moved swallows the next
 * click in the capture phase. A plain click is left untouched.
 */
const DRAG_SCROLL = `(el=>{
if(el.dataset.nmDragScroll==="1")return;el.dataset.nmDragScroll="1";
let down=!1,moved=!1,startX=0,startLeft=0;
el.addEventListener("wheel",e=>{
if(e.deltaY===0||e.deltaX!==0||e.shiftKey)return;
if(el.scrollWidth<=el.clientWidth)return;
el.scrollLeft+=e.deltaY;e.preventDefault()},{passive:!1});
el.addEventListener("pointerdown",e=>{
if(e.pointerType!=="mouse"||e.button!==0)return;
down=!0;moved=!1;startX=e.clientX;startLeft=el.scrollLeft});
el.addEventListener("pointermove",e=>{
if(!down)return;const dx=e.clientX-startX;
if(!moved&&Math.abs(dx)<4)return;
if(!moved){moved=!0;el.classList.add("narramem-dragging");try{el.setPointerCapture(e.pointerId)}catch{}}
el.scrollLeft=startLeft-dx;e.preventDefault()});
const end=e=>{if(!down)return;down=!1;
if(moved){try{el.releasePointerCapture(e.pointerId)}catch{}
el.classList.remove("narramem-dragging");
el.addEventListener("click",c=>{c.stopPropagation();c.preventDefault()},{capture:!0,once:!0})}
moved=!1};
el.addEventListener("pointerup",end);el.addEventListener("pointercancel",end);
el.addEventListener("dragstart",e=>{if(moved)e.preventDefault()})})`;

const moduleTabsDragScroll = {
  name: "module-tabs-drag-scroll",
  applied: "nmDragScroll",
  // Group 1: the element variable holding the freshly created strip.
  find: /([\w$]+)\.className="narramem-module-tabs";/u,
  replace(match) {
    const [, element] = match;
    return `${element}.className="narramem-module-tabs",${DRAG_SCROLL}(${element});`;
  },
};

/**
 * Multiple content tags, and an opt-in fallback to the whole message.
 *
 * Upstream reads exactly one tag from assistant messages and is fail-closed: no
 * complete `<tag>…</tag>` block means empty narrative text. That failure is
 * silent and lopsided — the message still counts toward the batch gate, and user
 * messages are never tag-filtered, so a preset emitting `<story_scene>` while the
 * setting says `content` yields memory built from the user's half of the
 * conversation only, with no warning.
 *
 * The tag field now takes a comma-separated list, and the entry `*` means "if no
 * listed tag matched, use the whole message". Keeping both in the one existing
 * field avoids touching the settings schema, and the field is already part of
 * `parameters_material`, so provenance stays honest: a plain `content` normalizes
 * to `content` exactly as before and changes no Checkpoint hash.
 */
export function narrativeTagNormalizeSource({ fn, fallback, pattern }) {
  return (
    `function ${fn}(e){if(typeof e!="string")return ${fallback};` +
    `let t=[...new Set(e.split(",").map(x=>x.trim())` +
    `.filter(x=>x.length>0&&(x==="*"||${pattern}.test(x))))];` +
    `return t.length===0?${fallback}:t.join(", ")}`
  );
}

export function narrativeProjectSource({ fn, fallback, normalize, escape, strip, offset }) {
  return (
    `function ${fn}(e,t,n=${fallback}){` +
    `if(t!=="assistant")return{text:e,strategy:"raw_selected_content",` +
    `raw_start_code_point:0,raw_end_code_point:[...e].length};` +
    `let S="assistant_configured_content_block_without_html_comments",` +
    `L=${normalize}(n).split(",").map(x=>x.trim()).filter(x=>x.length>0),` +
    `W=L.includes("*"),b=null;` +
    `for(let tg of L){if(tg==="*")continue;` +
    `let r=${escape}(tg),a=new RegExp("<"+r+">","giu"),o=new RegExp("</"+r+">","giu"),c=0;` +
    `for(;c<e.length;){a.lastIndex=c;let m=a.exec(e);if(m===null)break;` +
    `let d=m.index+m[0].length;o.lastIndex=d;let u=o.exec(e);if(u===null)break;` +
    // Mirror upstream's "last complete block", now across every listed tag.
    `if(b===null||d>b.start)b={start:d,end:u.index};c=u.index+u[0].length}}` +
    `if(b===null)return W?{text:${strip}(e),strategy:S,raw_start_code_point:0,` +
    `raw_end_code_point:[...e].length}:{text:"",strategy:S,` +
    `raw_start_code_point:0,raw_end_code_point:0};` +
    `return{text:${strip}(e.slice(b.start,b.end)),strategy:S,` +
    `raw_start_code_point:${offset}(e,b.start),raw_end_code_point:${offset}(e,b.end)}}`
  );
}

const narrativeTagNormalize = {
  name: "narrative-tag-list-normalize",
  applied: 'x==="*"||',
  // 1: normalize fn  2: default tag const  3: safe-tag pattern const
  find: /function ([\w$]+)\(e\)\{if\(typeof e!="string"\)return ([\w$]+);let t=e\.trim\(\);return ([\w$]+)\.test\(t\)\?t:\2\}/u,
  replace: (match) =>
    narrativeTagNormalizeSource({ fn: match[1], fallback: match[2], pattern: match[3] }),
};

const narrativeTagProject = {
  name: "narrative-tag-list-project",
  applied: 'W=L.includes("*")',
  // 1: projection fn  2: default tag const  3: normalize  4: escape  5: strip  6: code-point offset
  find: new RegExp(
    String.raw`function ([\w$]+)\(e,t,n=([\w$]+)\)\{if\(t!=="assistant"\)return\{text:e,` +
      String.raw`strategy:"raw_selected_content",raw_start_code_point:0,` +
      String.raw`raw_end_code_point:\[\.\.\.e\]\.length\};let i=([\w$]+)\(n\),r=([\w$]+)\(i\),` +
      String.raw`[\s\S]*?text:([\w$]+)\(e\.slice\(s\.start,s\.end\)\),` +
      String.raw`strategy:"assistant_configured_content_block_without_html_comments",` +
      String.raw`raw_start_code_point:([\w$]+)\(e,s\.start\),raw_end_code_point:\6\(e,s\.end\)\}\}`,
    "u",
  ),
  replace: (match) =>
    narrativeProjectSource({
      fn: match[1],
      fallback: match[2],
      normalize: match[3],
      escape: match[4],
      strip: match[5],
      offset: match[6],
    }),
};

/**
 * Report worldbook deletion by observation, not by return value.
 *
 * `delete_world_info` is bound straight to SillyTavern's `deleteWorldInfo`, and
 * `TavernMemoryRegistryStore.deleteChat()` treats a falsy result as failure:
 * it has already marked the record DELETE_PENDING by then, so it throws and
 * leaves that marker behind. SillyTavern does not document a return value, and
 * a host that resolves undefined therefore strands a registry record on every
 * chat deletion. Upstream never hit this because nothing called deleteChat.
 *
 * Checking the worldbook list instead is the same check deleteChat performs on
 * the next line, so a genuine failure is still reported — just not a silent one
 * invented by an undefined return.
 */
const worldbookDeleteResult = {
  name: "worldbook-delete-result",
  applied: "__nmName",
  // 1: everything up to the binding  2: world_names  3: SillyTavern's deleteWorldInfo
  find: /(get_worldbook_names:\(\)=>([\w$]+)\?\?\[\],[\s\S]{0,400}?)delete_world_info:([\w$]+),/u,
  replace(match) {
    const [, prefix, worldNames, deleteWorldInfo] = match;
    return (
      `${prefix}delete_world_info:async __nmName=>{await ${deleteWorldInfo}(__nmName);` +
      `return !(${worldNames}??[]).includes(__nmName)},`
    );
  },
};

/**
 * Make the idle headline agree with the runtime about "is there a chat".
 *
 * The panel decides with `getCurrentIdentity().chat_id !== null` while
 * `resolveScope` requires `character_id !== null && chat_id !== null`.
 * SillyTavern keeps returning the last chat id on the start screen, so with no
 * character selected the two disagree: the runtime sits at no_chat while the
 * panel believes a chat is present and reports progress for it — a spinner in
 * beta.67, a "collected 0/14" counter in beta.70. Either way the one screen
 * that should say "open a character card" says something else.
 *
 * Requiring both fields makes the headline match what the runtime actually
 * does. It changes one boolean feeding one line of text: no data, no memory, no
 * Checkpoint hash.
 *
 * Still unfixed as of beta.70; the anchor moved because upstream lifted the
 * expression into a `hasCurrentChat` binding, not because the check changed.
 */
const idleHeadlineCondition = {
  name: "idle-headline-condition",
  applied: ".character_id!==null&&",
  // 1: the hasCurrentChat binding  2: the port expression
  find: /let ([\w$]+)=([\w$.]+)\.getCurrentIdentity\(\)\.chat_id!==null,/u,
  replace(match) {
    const [, binding, port] = match;
    return (
      `let ${binding}=${port}.getCurrentIdentity().character_id!==null&&` +
      `${port}.getCurrentIdentity().chat_id!==null,`
    );
  },
};

/**
 * A batch that fails the finalizer freezes with no way to retry (upstream
 * 0.4.0-beta.75).
 *
 * When all seven modules commit, the batch moves to FINALIZING and the runtime
 * compiles the trusted Checkpoint locally — no model call. If that compile
 * throws, `commitFailure()` records `finalization_error_code` but deliberately
 * leaves `work_state.status` at FINALIZING, because the contract says the step
 * "remains retryable and the old checkpoint stays active".
 *
 * Nothing retries it. The runtime catch block publishes the snapshot as
 * `failed`, and `shouldContinue()` only chains on running/finalizing/
 * recall_ready — so the 1.5s idle chain stops. Meanwhile the panel shows the
 * failure box but hides its only button: `findManualRepairModule()` returns
 * null unless the batch status is NEEDS_USER or READY, and here it is
 * FINALIZING with every module COMMITTED. `active_module_id` is null too, so
 * the box reads "failed module: unknown" above no control at all.
 *
 * The state machine is fine — re-entering it retries the compile, which is why
 * "refresh status" already unsticks it. This patch stops hiding that: the
 * button stays visible whenever the failure box is up, and when no module is
 * individually repairable it relabels itself and runs the same refresh instead
 * of the per-module repair. The label is captured from the button's own initial
 * text on first render, so the translated string is never duplicated here.
 */
const finalizerRetryButton = {
  name: "finalizer-retry-button",
  applied: "nmStuckLabel",
  // 1: the repair button  2: the repairable module  3: the busy flag
  find: /,([\w$]+)\.hidden=([\w$]+)===null,\1\.disabled=([\w$]+)\}/u,
  replace(match) {
    const [, repairButton, repairModule, busy] = match;
    return (
      `,${repairButton}.dataset.nmStuckLabel??=${repairButton}.textContent,` +
      `${repairButton}.textContent=${repairModule}===null` +
      `?"Thử lại bước đang kẹt (không tốn lần gọi)"` +
      `:${repairButton}.dataset.nmStuckLabel,` +
      `${repairButton}.hidden=!1,${repairButton}.disabled=${busy}}`
    );
  },
};

/**
 * Companion to `finalizer-retry-button`: give the now-visible button something
 * to do when no single module is the culprit.
 *
 * The click handler bails out on exactly the condition that leaves the batch
 * stuck, so showing the button without this would produce a dead control. The
 * fallback path calls `on_refresh()` — the same handler behind "refresh status",
 * which re-reads the host chat and re-enters the runtime, hitting the FINALIZING
 * branch and recompiling. TT sync errors stay silent here for the same reason
 * they do on the refresh button: they are transient and already surfaced in the
 * headline.
 */
const finalizerRetryAction = {
  name: "finalizer-retry-action",
  applied: "__nmStuck",
  // 1: button  2: busy  3: findManualRepairModule  4: snapshot  5: setBusy  6: options
  find: new RegExp(
    String.raw`([\w$]+)\.addEventListener\("click",\(\)=>\{([\w$]+)\|\|` +
      String.raw`([\w$]+)\(([\w$]+)\.module_states,\4\.batch_status\)===null\|\|` +
      String.raw`\(([\w$]+)\(!0\),([\w$]+)\.on_manual_repair\(\)`,
    "u",
  ),
  replace(match) {
    const [, button, busy, findModule, snapshot, setBusy, options] = match;
    return (
      `${button}.addEventListener("click",()=>{if(${busy})return;` +
      `if(${findModule}(${snapshot}.module_states,${snapshot}.batch_status)===null){` +
      `${setBusy}(!0),${options}.on_refresh().catch(__nmStuck=>{` +
      `String(__nmStuck?.code??"").startsWith("TT_CHAT_")||` +
      `globalThis.alert("Thử lại thất bại: "+String(__nmStuck?.message??__nmStuck))` +
      `}).finally(()=>${setBusy}(!1));return}` +
      `(${setBusy}(!0),${options}.on_manual_repair()`
    );
  },
};

/**
 * The finalizer's real error message is thrown away (upstream 0.4.0-beta.75).
 *
 * `finalizationError()` maps eight recognised messages to specific codes and
 * funnels everything else into FINALIZER_CONTRACT_FAILED — a catch-all covering
 * at least six distinct failures ("M3 has no complete cold-readable partition",
 * "Novel Evidence … is missing from the current ledger", "THREAD_IMPACT head is
 * not an object", and more). The diagnostic then records only the code, so the
 * log cannot tell them apart and the panel shows a generic sentence.
 *
 * This patch records the underlying message alongside the code. Every message
 * in that family is structural — module ids, record ids, evidence ids, all
 * hashes — so `content_recorded: false` still holds. The one exception is the
 * Core wire schema message, which embeds a validator report that can quote a
 * field value; its tail is dropped rather than logged.
 */
const finalizerErrorDetail = {
  name: "finalizer-error-detail",
  applied: "__nmDetail",
  // 1: the raw error  2: the descriptor  3: errorDescriptor  4: the batch
  find: new RegExp(
    String.raw`on_failure_diagnostic:([\w$]+)=>\{let ([\w$]+)=([\w$]+)\(\1\);` +
      String.raw`this\.options\.on_diagnostic\?\.\("batch_finalization_failed",` +
      String.raw`\{batch_id:([\w$]+)\.batch_id,error_code:\2\.code,content_recorded:!1\}\)\}`,
    "u",
  ),
  replace(match) {
    const [, error, descriptor, describe, batch] = match;
    return (
      `on_failure_diagnostic:${error}=>{let ${descriptor}=${describe}(${error}),` +
      `__nmDetail=String(${descriptor}.message??"");` +
      `__nmDetail=/failed Core wire schema:/u.test(__nmDetail)` +
      `?__nmDetail.slice(0,__nmDetail.indexOf(":")+1)+" <lược bỏ>"` +
      `:__nmDetail.slice(0,240);` +
      `this.options.on_diagnostic?.("batch_finalization_failed",` +
      `{batch_id:${batch}.batch_id,error_code:${descriptor}.code,` +
      `error_detail:__nmDetail,content_recorded:!1})}`
    );
  },
};

export const PATCHES = [
  moduleTabsDragScroll,
  narrativeTagNormalize,
  narrativeTagProject,
  worldbookDeleteResult,
  idleHeadlineCondition,
  finalizerRetryButton,
  finalizerRetryAction,
  finalizerErrorDetail,
];
