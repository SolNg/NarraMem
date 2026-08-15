/**
 * Behaviour patches applied to the minified bundle, on top of the translation.
 *
 * Each patch anchors on a regular expression whose capture groups pick up the
 * minified identifiers, so a rebuild that renames them still matches. A patch
 * must match exactly once — `localize.mjs` aborts otherwise rather than guess.
 */

/**
 * Chat deletion never removes the Memory Book (upstream 0.4.0-beta.60).
 *
 * `INSTALL_BETA.md` states that deleting a chat deletes its NarraMem Memory Set
 * worldbook, but the CHAT_DELETED handler calls `TavernMemoryRegistry` — the v1
 * lifecycle registry. That class reads `NarraMem__REGISTRY__v1` and only deletes
 * books named `NarraMem__CONTROL__*`, `NarraMem__ARCHIVE__*` and five other v1
 * prefixes. The modular runtime writes `NarraMem__MEMORY__<id>` and registers it
 * in `NarraMem__REGISTRY__v2`, neither of which that code path knows about, so
 * it returns NOT_FOUND and deletes nothing.
 *
 * The correct v2 routine exists — `TavernMemoryRegistryStore.deleteChat()`, which
 * deletes `memory_book_name` — but its only caller is `resumePendingDeletions()`,
 * which processes records already marked DELETE_PENDING, a status only
 * `deleteChat()` itself sets. Nothing can enter that loop, so it is dead code.
 *
 * This patch runs the v2 routine first and keeps the v1 sweep afterwards for
 * installs carrying legacy books. Each call is isolated so one failure cannot
 * suppress the other, and the diagnostic reports both outcomes.
 */
const chatDeleteCleanup = {
  name: "chat-delete-cleanup",

  /** Sentinel proving this patch is already in the bundle. */
  applied: "__nmV2",

  // Group 1: the whole `let chatId=…,charId=…;` preamble, re-emitted verbatim.
  // 2: chat id  3: character id  4: host port  5: v1 registry
  // 6: v1 result  7: recordDiagnostic  8: logError
  find: new RegExp(
    String.raw`(let (\w+)=\w+\.replace\(\/\\\.jsonl\$\/iu,""\),(\w+)=(\w+)\.getCurrentIdentity\(\)\.character_id;)` +
      String.raw`(\w+)\.deleteMemorySetForChat\(\{chat_id:\2,\.\.\.\3===null\?\{\}:\{character_id:\3\}\}\)` +
      String.raw`\.then\((\w+)=>(\w+)\("deleted_chat_memory_cleanup",\{status:\6\.status,` +
      String.raw`deleted_worldbook_count:\6\.deleted_worldbook_names\.length,content_recorded:!1\}\),(\w+)\)`,
    "u",
  ),

  /** The v2 registry store: the only class exposing this trio of methods. */
  requires: { store: ["deleteChat", "resumePendingDeletions", "upsert"] },

  replace(match, { store }) {
    const [, preamble, chatId, charId, port, legacy, , record, logError] = match;
    // Deliberately verbose local names: the bundle's own identifiers are one or
    // two characters, so short names here risk shadowing a captured one.
    return (
      `${preamble}(async()=>{let __nmV2=null,__nmV1=null,__nmE2=null,__nmE1=null;` +
      `try{__nmV2=await new ${store}(${port}).deleteChat({host_user_id:"current_sillytavern_user",` +
      `chat_id:${chatId},...${charId}===null?{}:{character_or_group_id:${charId}}})}catch(__nmX){__nmE2=__nmX}` +
      `try{__nmV1=await ${legacy}.deleteMemorySetForChat({chat_id:${chatId},` +
      `...${charId}===null?{}:{character_id:${charId}}})}catch(__nmX){__nmE1=__nmX}` +
      `${record}("deleted_chat_memory_cleanup",{` +
      `status:__nmV2===null?"FAILED":__nmV2.status,` +
      `legacy_status:__nmV1===null?"FAILED":__nmV1.status,` +
      `memory_book_removed:__nmV2!==null&&__nmV2.removed!==null,` +
      `deleted_worldbook_count:(__nmV2!==null&&__nmV2.removed!==null?1:0)+` +
      `(__nmV1===null?0:__nmV1.deleted_worldbook_names.length),` +
      `content_recorded:!1});` +
      `if(__nmE2!==null)${logError}(__nmE2);if(__nmE1!==null)${logError}(__nmE1)})()`
    );
  },
};

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

export const PATCHES = [chatDeleteCleanup, moduleTabsDragScroll];
