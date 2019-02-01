" ============================================================================
" CLASS: Sider
"
" Base sider view area.
" There is only one instance of sider class during plugin lifecycle and
" reuses an existing buffer.
" ============================================================================

let s:Sider = {}
let g:RazorbackSiderArea = s:Sider

function! s:Sider.New()
    let newObj = copy(self)
    let newObj._is_open = 0
    let newObj._buffer_name = 'Explorer'
    let newObj._component = g:RazorbackNullComponent.New()
    return newObj
endfunction

" Check if buffer exists in the current tab
function! s:Sider.Exists()
    if !exists("t:SiderBufferName")
        return
    end

    return !empty(getbufvar(bufnr(t:SiderBufferName), 'Explorer'))
endfunction

" Get window number of Sider buffer.
function! s:Sider.GetWindowNum()
    if exists("t:SiderBufferName")
        return bufwinnr(t:SiderBufferName)
    endif

    return -1
endfunction

function! s:Sider.close()
    if !self._is_open
        return
    endif

    if winnr("$") != 1
        " Use the window ID to identify the currently active window or fall
        " back on the buffer ID if win_getid/win_gotoid are not available, in
        " which case we'll focus an arbitrary window showing the buffer.
        let l:useWinId = exists('*win_getid') && exists('*win_gotoid')

        if winnr() == s:Sider.GetWindowNum()
            exec "wincmd p"
            let l:activeBufOrWin = l:useWinId ? win_getid() : bufnr("")
            exec "wincmd p"
        else
            let l:activeBufOrWin = l:useWinId ? win_getid() : bufnr("")
        endif

        exec s:Sider.GetWindowNum()." wincmd w"
        close
        if l:useWinId
            exec "call win_gotoid(".l:activeBufOrWin.")"
        else
            exec bufwinnr(l:activeBufOrWin)." wincmd w"
        endif
    else
        close
    endif
endfunction

function s:Sider.open()
    let l:splitLocation = g:RazorbackSiderPosition ==# 'left' ? 'topleft ' : 'botright '
    let l:splitSize = g:RazorbackSiderSize

    if !g:RazorbackSiderArea.Exists()
        let t:SiderBufferName = self._buffer_name
        silent! execute l:splitLocation . 'vertical ' . l:splitSize . ' new'
        silent! execute 'edit ' . t:SiderBufferName
    else
        silent! execute l:splitLocation . 'vertical ' . l:splitSize . ' split'
        silent! execute 'buffer ' . t:SiderBufferName
    endif

    call self._setCommonBufOptions()

    setlocal winfixwidth
endfunction

function s:Sider.toggle()
    if !self._is_open
        call self.open()
        call self.render()
        let self._is_open = 1
    else
        call self.close()
        let self._is_open = 0
    endif
endfunction

" Set a component to render on open.
" Sider can have different components in its lifecycle,
" It will be set by the controller whenever needed.
function s:Sider.setComponent(component)
    let self._component = a:component
endfunction

" Render current component
function s:Sider.render()
    call self._component.render()
endfunction

function! s:Sider._setCommonBufOptions()
    " Options for a non-file/control buffer.
    setlocal bufhidden=hide
    setlocal buftype=nofile
    setlocal noswapfile

    " Options for controlling buffer/window appearance.
    setlocal foldcolumn=0
    setlocal foldmethod=manual
    setlocal nobuflisted
    setlocal nofoldenable
    setlocal nolist
    setlocal nospell
    setlocal nowrap

    setlocal nonu
    if v:version >= 703
        setlocal nornu
    endif

    iabc <buffer>

    " Highlight cursorline
    setlocal cursorline

    " use nerdtree syntax highlight
    setlocal filetype=nerdtree
endfunction
