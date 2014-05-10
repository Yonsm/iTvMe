#!/bin/sh
PATH=/opt/bin/:$PATH
SDIR=$(cd "${0%/*}"; pwd)

Echo()
{
	echo $*
	#echo $* >> $SDIR/thumb.log
}

MKV2MP4()
{
	if [[ "$1" =~ "/." ]]; then return; fi
	if [ ! -r "$1" ]; then return; fi

	DST="${1%.*}.mp4"
	if [ -f "$DST" ]; then return; fi

	Echo "MKV2MP4 $DST"
	ffmpeg -i "$1" -map 0 -c copy  "$DST" < /dev/null
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

	echo "<atv><body><dialog id=\"mkv2mp4\"><title><![CDATA["
	Echo "$DIR"
	echo "]]></title><description><![CDATA["
fi

if [ -f "$DIR" ]; then
	MKV2MP4 "$DIR"
else
	EXT="-iname *.mkv"
	find "$DIR" $DEP $EXT | while read f ; do MKV2MP4 "$f" ; done
fi

if [ ! -z $REQUEST_METHOD ]; then
	echo "]]></description></dialog></body></atv>"
fi
