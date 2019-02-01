let s:sider = g:RazorbackSiderArea.New()

function! razorback#ui#test_fn()
  let l:tree_view = g:RazorbackTreeViewComponent.New([
          \ '▸ something_0/',
          \ '▸ other_thing_00/',
          \ '▸ that_thing/'
          \])

  call s:sider.setComponent(l:tree_view)
  call s:sider.toggle()
endfunction
