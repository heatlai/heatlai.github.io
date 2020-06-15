# blog

## install
brew install ruby  
gem install jekyll  
gem install bundler  
bundle install  
> install 出錯的話  
    gem install bundler -v 1.12  
    bundle _1.12_ install

## run
bundle exec jekyll build  
bundle exec jekyll serve  
bundle exec jekyll serve --watch  
> => "http://localhost:4000"

bundle exec jekyll serve --host dev.hypenode.tw --port 7788
> => "http://dev.hypenode.tw:7788"