/**
 * Behaviour patches applied to the minified bundle, on top of the translation.
 *
 * Each patch anchors on a regular expression whose capture groups pick up the
 * minified identifiers, so a rebuild that renames them still matches. A patch
 * must match exactly once — `localize.mjs` aborts otherwise rather than guess.
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
  find: /(\w+)\.className="narramem-module-tabs";/u,
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
  find: /function (\w+)\(e\)\{if\(typeof e!="string"\)return (\w+);let t=e\.trim\(\);return (\w+)\.test\(t\)\?t:\2\}/u,
  replace: (match) =>
    narrativeTagNormalizeSource({ fn: match[1], fallback: match[2], pattern: match[3] }),
};

const narrativeTagProject = {
  name: "narrative-tag-list-project",
  applied: 'W=L.includes("*")',
  // 1: projection fn  2: default tag const  3: normalize  4: escape  5: strip  6: code-point offset
  find: new RegExp(
    String.raw`function (\w+)\(e,t,n=(\w+)\)\{if\(t!=="assistant"\)return\{text:e,` +
      String.raw`strategy:"raw_selected_content",raw_start_code_point:0,` +
      String.raw`raw_end_code_point:\[\.\.\.e\]\.length\};let i=(\w+)\(n\),r=(\w+)\(i\),` +
      String.raw`[\s\S]*?text:(\w+)\(e\.slice\(s\.start,s\.end\)\),` +
      String.raw`strategy:"assistant_configured_content_block_without_html_comments",` +
      String.raw`raw_start_code_point:(\w+)\(e,s\.start\),raw_end_code_point:\6\(e,s\.end\)\}\}`,
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

export const PATCHES = [moduleTabsDragScroll, narrativeTagNormalize, narrativeTagProject];
