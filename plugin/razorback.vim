let s:server = razorback#rpc#start_server()

" Notify server about an event.
function! s:Notify(...)
  call s:server.notify('RazorbackAutocmd', a:000)
endfunction

" Register autocmds to notify server on certain events.
function! s:Hook()
  augroup razorback
    autocmd VimEnter    * call s:Notify('VimEnter', [])
    autocmd FocusGained * call s:Notify('FocusGained')

    autocmd CursorHold  * call s:Notify('CursorHold', +expand('<abuf>'))
    autocmd CursorHoldI  * call s:Notify('CursorHoldI', +expand('<abuf>'))
    autocmd CursorMoved * call s:Notify('CursorMoved', +expand('<abuf>'))
    autocmd CursorMovedI * call s:Notify('CursorMovedI')
  augroup end
endfunction

" Do the thing.
call s:Hook()
