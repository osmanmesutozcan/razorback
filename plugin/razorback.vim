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

" Make a request to server and get result
function! s:Request(method, arguments)
  return call s:server.request(a:method, a:arguments)
endfunction

" Register autocmds to notify server on certain events.
" To read documentation `:help {AutoCmd}`
function! s:Initialize()
  runtime lib/sider.vim
  runtime lib/components/null.vim
  runtime lib/components/treeview.vim

  augroup razorback
    autocmd VimEnter     * call s:Notify('RazorbackAutocmd', ['VimEnter'])
    autocmd FocusGained  * call s:Notify('RazorbackAutocmd', ['FocusGained'])
    autocmd FocusLost    * call s:Notify('RazorbackAutocmd', ['FocusLost'])

    autocmd BufAdd       * call s:Notify('RazorbackAutocmd', ['BufAdd', +expand('<abuf>')])
    autocmd BufDelete    * call s:Notify('RazorbackAutocmd', ['BufDelete', +expand('<abuf>')])

    autocmd BufNewFile   * call s:Notify('RazorbackAutocmd', ['BufNewFile', +expand('<abuf>')])
    autocmd BufWritePre  * call s:Notify('RazorbackAutocmd', ['BufWritePre', +expand('<abuf>')])
    autocmd BufWritePost * call s:Notify('RazorbackAutocmd', ['BufWritePost', +expand('<abuf>')])

    autocmd BufEnter     * call s:Notify('RazorbackAutocmd', ['BufEnter', +expand('<abuf>')])
    autocmd BufWinEnter  * call s:Notify('RazorbackAutocmd', ['BufWinEnter', +expand('<abuf>')])

    autocmd BufLeave     * call s:Notify('RazorbackAutocmd', ['BufLeave', +expand('<abuf>')])
    autocmd BufWinLeave  * call s:Notify('RazorbackAutocmd', ['BufWinLeave', +expand('<abuf>')])

    autocmd WinEnter     * call s:Notify('RazorbackAutocmd', ['WinEnter', +expand('<abuf>')])
    autocmd WinLeave     * call s:Notify('RazorbackAutocmd', ['WinLeave', +expand('<abuf>')])

    autocmd CursorHold   * call s:Notify('RazorbackAutocmd', ['CursorHold', +expand('<abuf>')])
    autocmd CursorHoldI  * call s:Notify('RazorbackAutocmd', ['CursorHoldI', +expand('<abuf>')])
    autocmd CursorMoved  * call s:Notify('RazorbackAutocmd', ['CursorMoved', +expand('<abuf>')])
    autocmd CursorMovedI * call s:Notify('RazorbackAutocmd', ['CursorMovedI', +expand('<abuf>')])
  augroup end
endfunction

"""" Setup commands

" TODO: this command should be triggered from palette like ui.
command! -nargs=* RazorbackCommand :call s:Notify('RazorbackCommand', ['run', <f-args>])
" Setup keybindings. TODO: Move this to readme
nmap <leader>rr :RazorbackCommand

" Do the thing.
call s:Initialize()

" XXX: temp
let g:RazorbackSiderPosition = 'right' " One of [left right]
let g:RazorbackSiderSize = 32          " Width in numbers

function! s:Toggle()
  call razorback#ui#test_fn()
endfunction

command! -nargs=0 RazorbackUI :call s:Toggle()
map <C-f> :RazorbackUI<CR>

