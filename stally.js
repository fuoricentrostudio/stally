/*
*    Share Button and Counter - jQuery plugin
*    by Brando Meniconi (b.meniconi[at]fuoricentrostudio.com)
*/
(function ($) {

function Stally() {
        
    this.options = {
        displayName: true,
        displayCount: true,
        backendUrl: 'backend.php'
    };
    
    this._params = {
        url: window.location.href
    };
    
    this.networks = {
            delicious: {
                name: 'Delicious',
                url:'https://delicious.com/save?url={url}&title={title}'
            },        
            facebook: {
                name: 'Facebook', 
                url:'https://www.facebook.com/sharer.php?s=100&p[title]={title}&p[summary]={text}&p[url]={url}&p[images][0]={image}',
                count:function(self, callback){
                    self._request('https://api.facebook.com/restserver.php', {method: 'links.getStats', urls: [self._params.url], format: 'json'}, function(data){ callback(data[0].share_count); });
                }                
            },
            linkedin: {
                name: 'Linkedin',
                url:'https://www.linkedin.com/shareArticle?mini=true&url={url}&title={title}&summary={text}&source={url}',
                count:function(self, callback){ 
                    self._request('https://www.linkedin.com/countserv/count/share', {url: self._params.url, format: 'jsonp'}, function(data){ callback(data.count); });
                }                
            },            
            pinterest: {
                name: 'Pinterest', 
                url:'https://www.pinterest.com/pin/create/button/?media={image}&url={url}&description={text}',
                count:function(self, callback){ 
                    self._request('https://api.pinterest.com/v1/urls/count.json', {url: self._params.url}, function(data){ callback(data.count); });
                }                                
            },            
            plus: {
                name: 'Google Plus',
                url:'https://plus.google.com/share?url={url}',
                count:function(self, callback){          
                    self._request('http://free.sharedcount.com/url', 
                    {
                        url: self._params.url,
                        apikey: 'ce846af1d354ecbc49d09a4c608f3cefeed004e0' //set your key from www.sharedcount.com
                    }, 
                    function(data){ callback(data.GooglePlusOne); },
                    {type: 'GET', dataType: 'json'}                            
                    );
                }                    
            },            
            twitter:  {
                name: 'Twitter', 
                url:'https://twitter.com/intent/tweet?url={url}&text={text}', 
                count:function(self, callback){ 
                    self._request('https://cdn.api.twitter.com/1/urls/count.json', {url: self._params.url}, function(data){ callback(data.count); });
                }
            },      
            tumblr: {
                name: 'Tumblr',
                url:'https://tumblr.com/share?s=&v=3&t={title}&u={url}'
            },            
            vk: {
                name : 'VK',
                url:'https://vkontakte.ru/share.php?url={url}&title={title}&description={text}&image={image}&noparse=true',
                count:function(self, callback){ 
                    
                    VK = {
                        Share: {
                            count: function(idx, value){
                                callback(value);
                            }
                        }
                    };

                    $.ajax({
                        type: 'GET',
                        dataType: 'jsonp',
                        url: 'https://vk.com/share.php',
                        data: {act: 'count', index: 0, url: self._params.url}
                    })
                    .fail(function(data, status){
                        if(status !== 'parsererror'){
                            callback(0);
                        }
                    });
                    
                }                
            }
    };
} 

$.extend(Stally.prototype, {
    
    attach:function(elem, options){
        
            var self = this;
        
            $.extend(this.options, options);
            $.extend(this._params,$(elem).data('stally')); 
            
            $(elem).addClass(self._params.network);
            
            this.shareLink(self._params.network, function(url){
                $('<a/>').attr('href',url).text(self.networks[self._params.network].name || '').appendTo(elem);                
            });
            
            this.shareCount(self._params.network, function(count){
                if(typeof count !== 'undefined'){
                    $('<span/>').addClass('counter').text(count || '').appendTo(elem);                 
                }
            });                     
    },
    replaceParams: function(url, params){
        for(var param in params){
            url = url.replace('{'+param+'}', encodeURIComponent(params[param]));
        }        
        return url;
    },    
    shareLink:function(network, callback){
        if(typeof this.networks[network].url === 'string'){
            callback(this.replaceParams(this.networks[network].url, this._params));
        }else if(typeof this.networks[network].url === 'function'){
            this.networks[network].url(this, callback);
        }
    },
    shareCount:function(network, callback){
        if(typeof this.networks[network].count === 'string'){
            callback(parseInt(this.networks[network].count));
        }else if(typeof this.networks[network].count === 'function'){
            this.networks[network].count(this, callback);
        }
    },
    _backendRequest: function(network, url, callback, parameters){
        var params = $.extend({}, { dataType:'json' }, parameters);
        this._request(this.options.backendUrl, { method:'network', url: url }, function(data){ callback(data.count); }, params);  
    },
    _request: function(url, data, callback, parameters){        
        
        var request = $.extend({
            type: 'GET', 
            dataType: 'jsonp',
            url: url,
            data: data
        }, parameters);
        
        $.ajax(request).done(callback).fail(function(){ callback(0); });
    }
});

$.fn.stally = function(options){

	/* Verify an empty collection wasn't passed - Fixes #6976 */
	if ( !this.length ) {
		return this;
	}
        
	var otherArgs = Array.prototype.slice.call(arguments, 1);

	return this.each(function() {
            var factory = new Stally();
            factory.attach(this, options);
	});
};

$.stally = new Stally(); // singleton instance

$(document).ready(function(){
    $('.js-stally').stally();                 
});

return $.stally;

})(jQuery);