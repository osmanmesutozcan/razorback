let s:client = v:null

function! razorback#client#create(command)
  let client = {}

  let client.command = a:command
  let client.name = 'razorback'
  let client.chan_id = 0
  let client.running = 0
  let client.stderrs = []

  let client.start = function('s:start', [], client)
  let client.notify = function('s:notify', [], client)
  let client.request = function('s:request', [], client)

  let s:client = client
  return client
endfunction

function! s:start() dict
  if self.running | return | endif

  let chan_id = jobstart(self.command, {
    \ 'rpc': 1,
    \ 'on_stderr': {channel, messages -> s:on_stderr(self.name, messages)},
    \ 'on_exit': {channel, code -> s:on_exit(self.name, code)},
    \})

  if chan_id <= 0 || jobwait([chan_id], 10)[0] != -1
    echohl Error | echon 'Failed to start '.self.name.' service' | echohl None
    return
  endif

  let self['chan_id'] = chan_id
  let self['running'] = 1
endfunction

" Make a request to server.
function! s:request(method, args) dict
  return call('rpcrequest', [chan_id, a:method] + a:args)
endfunction

" Send a mesage to server via rpc.
function! s:notify(method, args) dict
  return call('rpcnotify', [self.chan_id, a:method] + a:args)
endfunction

function! s:on_stderr(name, messages)
  if empty(s:client) | return | endif

  let data = filter(copy(a:msgs), '!empty(v:val)')
  if empty(data) | return | endif

  call extend(s:client['stderrs'], data)
  let data[0] = '[vim-node-'.a:name.']: ' . data[0]
  call razorback#util#echo_messages('Error', data)
endfunction

" Cleanup on NeoVim exit.
function! s:on_exit(name, code) abort
  if empty(s:client) | return | endif
  if s:client['running'] != 1 | return | endif

  let s:client['running'] = 0
  let s:client['chan_id'] = 0

  if a:code != 0
    echohl Error | echon 'client '.a:name. ' abnormal exit with: '.a:code | echohl None
  endif
endfunction
