function! razorback#rpc#start_server()
  let command = [razorback#platform#get_server_binary()]

  let server = {}
  let server.client = razorback#client#create(command)
  let server.notify = function('razorback#rpc#notify')
  let server.request = function('razorback#rpc#request')

  call server.client.start()
  return server
endfunction

function! razorback#rpc#notify(method, args) dict abort
  call self.client.notify(a:method, a:args)
endfunction

function! razorback#rpc#request(method, args) dict abort
  call self.client.request(a:method, a:args)
endfunction
