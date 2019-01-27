let s:server = razorback#rpc#start_server()

function! s:CommandList(...) abort
  return "a\nb\nc"
endfunction

" Notify server about an event.
" NOTE: All of the args passed via nofify should be
" a `list`.
function! s:Notify(method, arguments)
  call s:server.notify(a:method, a:arguments)
endfunction

" Register autocmds to notify server on certain events.
function! s:Hook()
  augroup razorback
    autocmd VimEnter     * call s:Notify('VimEnter', [])
    autocmd FocusGained  * call s:Notify('FocusGained', [])

    autocmd CursorHold   * call s:Notify('CursorHold', [+expand('<abuf>')])
    autocmd CursorHoldI  * call s:Notify('CursorHoldI', [+expand('<abuf>')])
    autocmd CursorMoved  * call s:Notify('CursorMoved', [+expand('<abuf>')])
    autocmd CursorMovedI * call s:Notify('CursorMovedI', [+expand('<abuf>')])
  augroup end
endfunction

"""" Setup commands

" TODO: this command should be triggered from palette like ui.
command! -nargs=* RazorbackCommand :call s:Notify('RazorbackCommand', ['run', <f-args>])

" Setup keybindings. TODO: Move this to readme
nmap <leader>rr :RazorbackCommand 

" Do the thing.
call s:Hook()
