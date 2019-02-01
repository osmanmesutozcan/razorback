" Plugin root directory
let s:root = expand('<sfile>:h:h:h')

let s:LINUX = 'linux'
let s:WINDOWS = 'windows'
let s:MACINTOSH = 'macintosh'

function! razorback#platform#get_current_platform()
  let is_win = has('win64') || has('win32')
  let is_mac = has('mac') || has('macvim')

  if is_win | return s:WINDOWS | endif
  if is_mac | return s:MACINTOSH | endif
  return s:LINUX
endfunction

" FIXME: find the problem with build.
" return [s:root.'/build/razorback-linux']
function! razorback#platform#get_server_command()
  let current_platform = razorback#platform#get_current_platform()

  if current_platform ==# s:LINUX
    " if $RBACK_DEBUG
      return ['node', '--inspect', s:root.'/bin/index.js']
    " endif

    " return [s:root.'/bin/index.js']
  endif
endfunction
