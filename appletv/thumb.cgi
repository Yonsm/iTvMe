#!/bin/sh
PATH=/opt/bin/:$PATH
SDIR=$(cd "${0%/*}"; pwd)

Echo()
{
	echo $*
	#echo $* >> $SDIR/thumb.log
}

MakeThumb()
{
	if [[ "$1" =~ "/." ]]; then return; fi
	if [ ! -r "$1" ]; then return; fi

	DST="${1%/*}/.thumb.${1##*/}.jpg"
	if [ -f "$DST" ]; then return; fi

	SKIP=""
	FSIZE=$(stat -c %s "$1")
	if [ $FSIZE -gt 1024000000 ]; then 
		SKIP="-ss 00:03:00"
	elif [ $FSIZE -gt 512000000 ]; then 
		SKIP="-ss 00:01:00"
	elif [ $FSIZE -gt 256000000 ]; then 
		SKIP="-ss 00:00:30"
	elif [ $FSIZE -gt 128000000 ]; then 
		SKIP="-ss 00:00:10"
	fi

	Echo "File thumbnail $DST"
	ffmpeg $SKIP -i "$1" -vf crop=in_h -y -f image2 -an -vframes 1 -s 268x268 "$DST" < /dev/null
	if [ ! -f "$DST" ]; then
		ffmpeg $SKIP -i "$1" -vf crop=in_w:in_w -y -f image2 -an -vframes 1 -s 268x268 "$DST" < /dev/null
	fi
	if [ ! -f "$DST" ]; then
		Echo "  Failed"
		return;
	fi

	OVR="$SDIR/thumb/${1##*.}.png"
	if [ -f "$OVR" ]; then
		ffmpeg -i "$DST" -vf "movie=$OVR [watermark]; [in][watermark] overlay=main_w-overlay_w:main_w-overlay_h [out]" "$DST" < /dev/null
	fi

	if [ -f "$SDIR/thumb/dir.jpg" ]; then
		THUMB="${DST%/*}"
		THUMB="${THUMB%/*}/.thumb.${THUMB##*/}.jpg"
		if [ ! -f "$THUMB" ]; then
			Echo "Folder thumbnail $THUMB"
			ffmpeg -i "$SDIR/thumb/dir.jpg" -vf "movie=$DST,scale=iw/2:ih/2 [watermark]; [in][watermark] overlay=0:0 [out]" "$THUMB" < /dev/null
			chmod 644 "$THUMB"
		else
			THMOD=$(ls -l "$THUMB")
			if [[ $THMOD == -rw-r--r--* ]]; then
				ffmpeg -i "$THUMB" -vf "movie=$DST,scale=iw/2:ih/2 [watermark]; [in][watermark] overlay=0:main_h-overlay_h [out]" "$THUMB" < /dev/null
				chmod 646 "$THUMB"
			elif [[ $THMOD == -rw-r--rw-* ]]; then
				ffmpeg -i "$THUMB" -vf "movie=$DST,scale=iw/2:ih/2 [watermark]; [in][watermark] overlay=main_w-overlay_w:0 [out]" "$THUMB" < /dev/null
				chmod 664 "$THUMB"
			elif [[ $THMOD == -rw-rw-r--* ]]; then
				ffmpeg -i "$THUMB" -vf "movie=$DST,scale=iw/2:ih/2 [watermark]; [in][watermark] overlay=main_w-overlay_w:main_h-overlay_h [out]" "$THUMB" < /dev/null
				chmod 666 "$THUMB"
			fi
		fi
	fi
}

if [ -z $REQUEST_METHOD ]; then
	DIR=$1
	if [ -z "$DIR" ]; then
		echo "Usage: $0 <DIR|FILE>"
		exit
	fi

	Echo "Process $DIR"
else
	echo -e "Content-type: text/xml\n"
	DIR="${SDIR%/*}"
	if [ ! -z $QUERY_STRING ]; then
		QS=`echo -e "${QUERY_STRING//\%/\\x}"`
		DEP="-maxdepth 1"
	else
		QS="media/"
	fi
	DIR="$DIR/$QS"

	echo "<atv><body><dialog id=\"thumb\"><title><![CDATA["
	Echo "$DIR"
	echo "]]></title><description><![CDATA["
fi

PSNUM=`ps ax|grep thumb.cgi|grep -v grep|wc -l`
if [ $PSNUM -gt 2 ]; then
	Echo Another process is working, ignore $DIR
elif [ -f "$DIR" ]; then
	MakeThumb "$DIR"
else
	EXT="-iname *.mov -or -iname *.mp4 -or -iname *.m4v -or -iname *.mkv -or -iname *.mpg -or -iname *.avi"
	EXT="$EXT -or -iname *.jpg -or -iname *.png -or -iname *.gif -or -iname *.bmp"
	EXT="$EXT -or -iname *.mp3 -or -iname *.aac"
	find "$DIR" $DEP $EXT | while read f ; do MakeThumb "$f" ; done
fi

if [ ! -z $REQUEST_METHOD ]; then
	echo "]]></description></dialog></body></atv>"
fi

