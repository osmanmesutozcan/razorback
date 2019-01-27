" Function: lh#common#echomsg_multilines {{{2
function! lh#common#echomsg_multilines(text)
  let lines = type(a:text) == type([]) ? a:text : split(a:text, "[\n\r]")
  for line in lines
    echomsg line
  endfor
endfunction

" Function: lh#common#error_msg {{{2
function! lh#common#error_msg(text)
  if has('gui_running')
    call confirm(a:text, '&Ok', '1', 'Error')
  else
    " echohl ErrorMsg
    echoerr a:text
    " echohl None
  endif
endfunction

" Function: lh#common#warning_msg {{{2
function! lh#common#warning_msg(text)
  echohl WarningMsg
  " echomsg a:text
  call lh#common#echomsg_multilines(a:text)
  echohl None
endfunction
