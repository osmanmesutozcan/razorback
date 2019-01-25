function! razorback#util#echo_messages(hl, msgs)
  if empty(a:msgs) | return | endif

  execute 'echohl '.a:hl
  let msgs = copy(a:msgs)

  if pumvisible()
    let msgs = msgs[0: 0]
  endif

  for msg in msgs
    if !empty(msg)
      echom msg
    endif
  endfor
  echohl None
  redraw
endfunction
