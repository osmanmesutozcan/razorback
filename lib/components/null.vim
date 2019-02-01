" ============================================================================
" CLASS: NullComponent
"
" A noop component
" ============================================================================

let s:NullC = {}
let g:RazorbackNullComponent = s:NullC

function! s:NullC.New()
    let newObj = copy(self)
    return newObj
endfunction

" Render UI to currently opened window.
function! s:NullC.render()
    " NOOP
endfunction
