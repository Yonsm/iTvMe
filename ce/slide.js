
// atv.Element extensions
if(atv.Element)
{
	atv.Element.prototype.getElementsByTagName = function(tagName)
	{
		return this.ownerDocument.evaluateXPath("descendant::" + tagName, this);
	};

	atv.Element.prototype.getElementByTagName = function(tagName)
	{
		var elements = this.getElementsByTagName(tagName);
		if(elements && elements.length > 0)
		{
			return elements[0];
		};
		return undefined;
	};
};


// Loads the full screen media browser
function onPhotoSelection(photoID)
{
	var photoArray = createPhotoArray(photoID);
	loadFullScreenMediaBrowser(photoArray.photoDicts, photoArray.initialSelection);
};

// Starts the slide show with the selected images.
function onSlideshowStart(photoID)
{
	var photoArray = createPhotoArray(photoID);
	atv.slideShow.onExit = function(lastDisplayedPhotoId)
	{
		// updateInitialSelection ( lastDisplayedPhotoId );
	};
	atv.slideShow.run(photoArray.initialSelection, photoArray.photoDicts);
};

// Loads the settings page.
function onSettingsSelection(photoID)
{
	var photoArray = createPhotoArray(photoID);
	atv.slideShow.showSettings(photoArray.photoDicts);
};

// creates a collection array from the photos provided
function createPhotoArray(photoID)
{
	var initialSelection = 0;
	var photoDicts = [];

	var photos = document.evaluateXPath('//photo | //video');
	for(var i = 0; i < photos.length; ++i)
	{
		var photo = photos[i],
			commentsBadge = photo.getElementByTagName('commentsBadge'),
			type = photo.tagName,
			collectionArrayName = (type == "photo") ? "assets" : "previewImages";
		photoAssets = (type == "photo") ? photo.getElementsByTagName('photoAsset') : photo.getElementsByTagName('videoPreviewImage'), caption = (photo.getElementByTagName('caption')) ? photo.getElementByTagName('caption').textContent : null,

		photoDict = {};

		photoDict.id = photo.getAttribute('id');
		photoDict.type = type;

		if(caption)
		{
			photoDict.caption = caption;
		};

		if(commentsBadge)
		{
			photoDict.badges = [
			{
				"type": "commentsBadge",
				"style": commentsBadge.getAttribute('style')
			}];
		};


		photoDict[collectionArrayName] = [];
		for(var assetIndex = 0; assetIndex < photoAssets.length; ++assetIndex)
		{
			var photoAsset = photoAssets[assetIndex];

			var src = photoAsset.getAttribute('src');
			var thmumb = src.replace('.thumb.', '');
			if(src.length != thmumb.length)
			{
				src = thmumb.substring(0, thmumb.length - 4);
			}

			var width = photoAsset.getAttribute('width');
			var height = photoAsset.getAttribute('height');

			var photoAssetDict = {
				"width": width ? parseInt(width) : 0,
				"height": height ? parseInt(height) : 0,
				"src": src
			};

			photoDict[collectionArrayName].push(photoAssetDict);
		};

		if(photoDict.id == photoID)
		{
			initialSelection = photoDicts.length;
		};

		photoDicts.push(photoDict);
	};

	var photoArray = {
		"photoDicts": photoDicts,
		"initialSelection": initialSelection
	};

	return photoArray;
};

// Generic wrapper to handle the creation of the fullscreen photo browser.
function loadFullScreenMediaBrowser(photoDicts, initialSelection)
{
	var fullScreenMediaBrowser = new atv.FullScreenMediaBrowser();

	fullScreenMediaBrowser.onLoadMetadata = function(photoID)
	{

		var photoInfo = document.getElementById(photoID).getElementByTagName('stash'),
			comments = [],
			metadata = {};

		if(photoInfo)
		{
			var photoCommentElements = photoInfo.ownerDocument.evaluateXPath("comments/comment", photoInfo),
				liked = photoInfo.getElementByTagName('liked');

			if(liked)
			{
				metadata.liked = (liked.getAttribute('status') == "YES") ? true : false;
				metadata.likeStatus = liked.textContent;
			}

			for(var i = 0; i < photoCommentElements.length; i++)
			{
				var comment = {
					"text": photoCommentElements[i].getElementByTagName('text').textContent,
					"footer": photoCommentElements[i].getElementByTagName('footer').textContent
				};
				comments.push(comment);
			}

			metadata.comments = comments;

		};

		// Callback to send the updated metadata to the browser.
		fullScreenMediaBrowser.updateMetadata(photoID, metadata);
	};


	// Callback to be used when the photo is selected in fullscreen only mode.
	fullScreenMediaBrowser.onItemSelection = function(photoID)
	{
		if(photoID.indexOf('video') > -1)
		{

			var urlList = document.evaluateXPath("//video[@id='" + photoID + "']/stash/videoUrl");

			var url = (urlList.length > -1) ? urlList[0].textContent : false;
			if(url)
			{
				atv.loadURL(url);
			}


		}
		else
		{
			fullScreenMediaBrowser.hide();
		}
	};

	// Called back when a user presses select in comments view. This is technically used for like and unlike, however it can update the entire metadata object for the photo.
	fullScreenMediaBrowser.onLikeSelection = function(photoID, metadata)
	{
		metadata["liked"] = !metadata["liked"];
		metadata["likeStatus"] = (metadata["liked"]) ? 'you like this.' : 'like';
		fullScreenMediaBrowser.updateMetadataLiked(photoID, metadata);
	};

	// Called back when the Fullscreen Photo Browser is hidden
	fullScreenMediaBrowser.onHide = function()
	{
		var photoBatches = document.evaluateXPath('//photoBatch');

		batchloop: for(var batchIndex = 0; batchIndex < photoBatches.length; ++batchIndex)
		{
			var photos = photoBatches[batchIndex].getElementsByTagName('photo');

			for(var photoIndex = 0; photoIndex < photos.length; ++photoIndex)
			{
				if(fullScreenMediaBrowser.selectedPhotoID == photos[photoIndex].getAttribute('id'))
				{

					//updateInitialSelection(batchIndex, photoIndex);
					break batchloop;
				};
			};
		};
	};

	fullScreenMediaBrowser.show(photoDicts, initialSelection);
};
