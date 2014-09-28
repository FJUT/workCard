composite logo.png teacher.jpg -gravity southeast -geometry +5+10 -dissolve 80 dest.jpg


gm convert -font /Library/Fonts/华文黑体.ttf -fill white -pointsize 48 -draw "text 40,45 '悟道前端' " teacher.jpg text.jpg


gm convert 
 -density 300x300 
 -resize 1062x1616 
 -crop 548x870+124+0  

 -fill 'rgba(0,0,0,75)' -draw "Rectangle 0,390 273,435"  
 -font arial -fill white -pointsize 16 -draw "text 40,410 'King'"  
 -font arial -fill white -pointsize 16 -draw "text 40,430 'cpjmj'"  
 -font arial -fill 'rgb(80,150,240)' -pointsize 18 -draw "text 160,420 'TK'"   
 mm.jpg dest.jpg

gm convert -density 300x300 -resize 1062x1616 -crop 548x870+248+0 -fill 'rgba(0,0,0,75)' -draw "Rectangle 0,770 548,870" -font arial -fill white -pointsize 8 -draw "text 80,820 'King'" -font arial -fill white -pointsize 8 -draw "text 80,860 'cpjmj'" -font arial -fill 'rgb(80,150,240)' -pointsize 9 -draw "text 320,840 'TK'" -quality 100 +profile "*" mm.jpg dest.jpg

gm composite logo.png dest.jpg -gravity northwest dest.jpg

composite logo.png mm.jpg -gravity northwest dest.jpg

gm 
convert 
-density 300x300 
-resize 1062x1616 
-crop 548x870+248+0 
-font arial
-fill 'rgba(0,0,0,75)' 
-draw "Rectangle 0,770 548,870" 
-fill white -pointsize 8 
-draw "text 80,820 'King'" 
-draw "text 80,860 'cpjmj'" 
-fill 'rgb(80,150,240)' 
-pointsize 9 
-draw "text 320,840 'TK'" 
-quality 100 
+profile "*" 
mm.jpg 
test.jpg

gm convert -density 300x300 -resize 1062x1616 -crop 548x870+248+0 -font arial -fill 'rgba(0,0,0,75)' -draw "Rectangle 0,770 548,870" -fill white -pointsize 8 -draw "text 80,820 'King'" -draw "text 80,860 'cpjmj'" -fill 'rgb(80,150,240)' -pointsize 9 -draw "text 320,840 'TK'" -quality 100 +profile "*" mm.jpg dest.jpg composite logo.png dest.jpg -gravity northwest dest.jpg