" ============================================================================
" CLASS: Dropdown
"
" Base dropdown view area.
" There is only one instance of dropdown class during plugin lifecycle and
" reuses an existing buffer.
" ============================================================================

let s:Dropdown = {}
let g:RazorbackDropdownArea = s:Dropdown

function! s:Dropdown.New()
    let newObj = copy(self)
    let newObj._is_open = 0
    let newObj._buffer_name = 'Dropdown'
    let newObj._component = g:RazorbackNullComponent.New()
    return newObj
endfunction

" Check if buffer exists in the current tab
function! s:Dropdown.Exists()
    if !exists("t:DropdownBufferName")
        return
    end

    return !empty(getbufvar(bufnr(t:DropdownBufferName), 'Dropdown'))
endfunction

" Get window number of Dropdown buffer.
function! s:Dropdown.GetWindowNum()
    if exists("t:DropdownBufferName")
        return bufwinnr(t:DropdownBufferName)
    endif

    return -1
endfunction

function! s:Dropdown.close()
    if !self._is_open
        return
    endif

    if winnr("$") != 1
        " Use the window ID to identify the currently active window or fall
        " back on the buffer ID if win_getid/win_gotoid are not available, in
        " which case we'll focus an arbitrary window showing the buffer.
        let l:useWinId = exists('*win_getid') && exists('*win_gotoid')

        if winnr() == s:Dropdown.GetWindowNum()
            exec "wincmd p"
            let l:activeBufOrWin = l:useWinId ? win_getid() : bufnr("")
            exec "wincmd p"
        else
            let l:activeBufOrWin = l:useWinId ? win_getid() : bufnr("")
        endif

        exec s:Dropdown.GetWindowNum()." wincmd w"
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

function s:Dropdown.open()
    let l:splitLocation = g:RazorbackDropdownPosition ==# 'top' ? 'topleft ' : 'botright '
    let l:splitSize = g:RazorbackDropdownSize

    if !g:RazorbackDropdownArea.Exists()
        let t:DropdownBufferName = self._buffer_name
        silent! execute l:splitLocation . l:splitSize . ' new'
        silent! execute 'edit ' . t:DropdownBufferName
    else
        silent! execute l:splitLocation . l:splitSize . ' split'
        silent! execute 'buffer ' . t:DropdownBufferName
    endif

    call self._setCommonBufOptions()

    setlocal winfixwidth
endfunction

function s:Dropdown.toggle()
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
" Dropdown can have different components in its lifecycle,
" It will be set by the controller whenever needed.
function s:Dropdown.setComponent(component)
    let self._component = a:component
endfunction

" Render current component
function s:Dropdown.render()
    call self._component.render()
endfunction

function! s:Dropdown._setCommonBufOptions()
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
