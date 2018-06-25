---
layout: post
title:  '[Mac] iTerm2 + oh-my-zsh 安裝'
subtitle: 'Mac - iTerm2 + oh-my-zsh install'
background: '/img/posts/04.jpg'

date: 2018-06-25

tags: [Mac]
---
# 安裝 Homebrew
[Homebrew](https://brew.sh/index_zh-tw)

```
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

# 安裝iTerm 2
[iTerm2](http://iterm2.com/)  
下載後解壓縮，放到 應用程式。

# 安裝 oh-my-zsh

```
sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
```

# 安裝字型 Hack Nerd Font

```
brew tap caskroom/fonts
brew cask install font-hack-nerd-font
```

# 安裝 powerlevel9k (oh-my-zsh 的 theme) 
```
git clone https://github.com/bhilburn/powerlevel9k.git ~/.oh-my-zsh/custom/themes/powerlevel9k
```

# 修改 zsh theme 為 powerlevel9k
```
vim ~/.zshrc

# 主題
ZSH_THEME="powerlevel9k/powerlevel9k"

# POWERLEVEL9K 字型設定
POWERLEVEL9K_MODE='nerdfont-complete'
# command line 左邊想顯示的內容
POWERLEVEL9K_LEFT_PROMPT_ELEMENTS=(dir dir_writable vcs)
# command line 右邊想顯示的內容
POWERLEVEL9K_RIGHT_PROMPT_ELEMENTS=(status time)

# 儲存後套用設定
exec $SHELL
```

# 修改 iTerm2 的 color scheme (選用)

```
Preferences > Profiles > Colors

右下角 Color Presets 選 Tango Dark 後
Foreground 改 c7c7c7
```

# 修改 iTerm2 的 Font
```
Preferences > Profiles > Text
點 Change Font 選 Hack Nerd Font
(選用) Size 用 18 
```

# CLI Syntax highlighting (選用)

```
brew install zsh-syntax-highlighting

vim ~/.zshrc

# 加在檔案最後面
source /usr/local/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
```