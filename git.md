git rm -r --cached . #删除追踪状态
git add . 
git commit -m "fixed untracked files"
git pull
git push origin master