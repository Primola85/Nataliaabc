
	rangeFix.isBroken = function () {
		var boundingRect, p, span, t1, t2, img, range, jscriptVersion;

		if ( broken === undefined ) {
			p = document.createElement( 'p' );
			span = document.createElement( 'span' );
			t1 = document.createTextNode( 'aa' );
			t2 = document.createTextNode( 'aa' );
			img = document.createElement( 'img' );
			img.setAttribute( 'src', '#null' );
			range = document.createRange();

			broken = {};

			p.appendChild( t1 );
			p.appendChild( span );
			span.appendChild( img );
			span.appendChild( t2 );

			document.body.appendChild( p );

			range.setStart( t1, 1 );
			range.setEnd( span, 0 );


			broken.getClientRects = broken.getBoundingClientRect = range.getClientRects().length > 1;

			if ( !broken.getClientRects ) {
								range.setEnd( t2, 1 );
				broken.getClientRects = broken.getBoundingClientRect = range.getClientRects().length === 2;
			}

			if ( !broken.getBoundingClientRect ) {

				range.setEnd( range.startContainer, range.startOffset );
				boundingRect = range.getBoundingClientRect();
				broken.getBoundingClientRect = boundingRect.top === 0 && boundingRect.left === 0;
			}

			document.body.removeChild( p );

			jscriptVersion = window.ActiveXObject && new Function( '/*@cc_on return @_jscript_version; @*/' )();
			broken.ieZoom = !!jscriptVersion && jscriptVersion <= 10;
		}
		return broken;
	};


	function zoomFix( rectOrRects ) {
		var zoom;
		if ( !rectOrRects ) {
			return rectOrRects;
		}

		if ( screen.deviceXDPI === screen.logicalXDPI ) {
			return rectOrRects;
		}

		if ( 'length' in rectOrRects ) {
			return Array.prototype.map.call( rectOrRects, zoomFix );
		}

		zoom = screen.deviceXDPI / screen.logicalXDPI;
		return {
			top: rectOrRects.top / zoom,
			bottom: rectOrRects.bottom / zoom,
			left: rectOrRects.left / zoom,
			right: rectOrRects.right / zoom,
			width: rectOrRects.width / zoom,
			height: rectOrRects.height / zoom
		};
	}


	function batchPush( arr, data ) {

		var length,
			index = 0,
			batchSize = 1024;
		if ( batchSize >= data.length ) {

			return Array.prototype.push.apply( arr, data );
		}
		while ( index < data.length ) {

			length = Array.prototype.push.apply(
				arr, Array.prototype.slice.call( data, index, index + batchSize )
			);
			index += batchSize;
		}
		return length;
	}


	rangeFix.getClientRects = function ( range ) {
		var rects, endContainer, endOffset, partialRange,
			broken = this.isBroken();

		if ( broken.ieZoom ) {
			return zoomFix( range.getClientRects() );
		} else if ( !broken.getClientRects ) {
			return range.getClientRects();
		}


		rects = [];
		endContainer = range.endContainer;
		endOffset = range.endOffset;
		partialRange = document.createRange();

		while ( endContainer !== range.commonAncestorContainer ) {
			partialRange.setStart( endContainer, 0 );
			partialRange.setEnd( endContainer, endOffset );

			batchPush( rects, partialRange.getClientRects() );

			endOffset = Array.prototype.indexOf.call( endContainer.parentNode.childNodes, endContainer );
			endContainer = endContainer.parentNode;
		}

	    partialRange = range.cloneRange();
		partialRange.setEnd( endContainer, endOffset );
		batchPush( rects, partialRange.getClientRects() );
		return rects;
	};


	rangeFix.getBoundingClientRect = function ( range ) {
		var i, l, boundingRect, rect, nativeBoundingRect, broken,
			rects = this.getClientRects( range );


		if ( rects.length === 0 ) {
			return null;
		}

		nativeBoundingRect = range.getBoundingClientRect();
		broken = this.isBroken();

		if ( broken.ieZoom ) {
			return zoomFix( nativeBoundingRect );
		} else if ( !broken.getBoundingClientRect ) {
			return nativeBoundingRect;
		}


		if ( nativeBoundingRect.width === 0 && nativeBoundingRect.height === 0 ) {
			return rects[ 0 ];
		}

		for ( i = 0, l = rects.length; i < l; i++ ) {
			rect = rects[ i ];
			if ( !boundingRect ) {
				boundingRect = {
					left: rect.left,
					top: rect.top,
					right: rect.right,
					bottom: rect.bottom
				};
			} else {
				boundingRect.left = Math.min( boundingRect.left, rect.left );
				boundingRect.top = Math.min( boundingRect.top, rect.top );
				boundingRect.right = Math.max( boundingRect.right, rect.right );
				boundingRect.bottom = Math.max( boundingRect.bottom, rect.bottom );
			}
		}
		if ( boundingRect ) {
			boundingRect.width = boundingRect.right - boundingRect.left;
			boundingRect.height = boundingRect.bottom - boundingRect.top;
		}
		return boundingRect;
	};

	return rangeFix;
} ) );