let s:sider = g:RazorbackSiderArea.New()
let s:dropdown = g:RazorbackDropdownArea.New()

function! razorback#ui#test_sider()
  let l:tree_view = g:RazorbackTreeViewComponent.New([
          \ '▸ something_0/',
          \ '▸ other_thing_00/',
          \ '▸ that_thing/'
          \])

  call s:sider.setComponent(l:tree_view)
  call s:sider.toggle()
endfunction

function! razorback#ui#test_dropdown()
  let l:tree_view = g:RazorbackTreeViewComponent.New([
  \ '',
  \ 'tsserver.restart',
  \ 'tsserver.goToDefinition'
  \])

  call s:dropdown.setComponent(l:tree_view)
  call s:dropdown.toggle()
endfunction
