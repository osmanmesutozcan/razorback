" ============================================================================
" CLASS: TreeView
"
" Collapsable tree UI component.
" ============================================================================

let s:TW = {}
let g:RazorbackTreeViewComponent = s:TW

function! s:TW.New(render_items)
    let newObj = copy(self)
    let newObj._render_items = a:render_items
    return newObj
endfunction

" Render UI to currently opened window.
function! s:TW.render()
    setlocal noreadonly modifiable

    " remember the top line of the buffer and the current line so we can
    " restore the view exactly how it was
    let curLine = line(".")
    let curCol = col(".")
    let topLine = line("w0")

    " delete all lines in the buffer (being careful not to clobber a register)
    silent 1,$delete _

    " draw the header line
    let header = 'HEADER'
    call setline(line(".")+1, header)
    call cursor(line(".")+1, col("."))

    " draw the tree
    " silent put =self._render_items

    " delete the blank line at the top of the buffer
    silent 1,1delete _

    " restore the view
    let old_scrolloff=&scrolloff
    let &scrolloff=0
    call cursor(topLine, 1)
    normal! zt
    call cursor(curLine, curCol)
    let &scrolloff = old_scrolloff

    setlocal readonly nomodifiable
endfunction
