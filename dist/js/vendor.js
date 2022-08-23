class customSelect {

    constructor(option) {
        this.selector = option.selector;
        this.selectAll = document.querySelectorAll(this.selector)

    }

    init() {
        this.renderTemplate()
        this.clickEventOut()
    }

    reinit(elem) {
        const _this = this;

        let item = elem.parentNode

        if (item.querySelector('.select-styled')) {
            item.querySelector('.select-styled').remove()
            item.querySelector('.select-list').remove()
        }

        _this.renderOption(item)

    }

    ajaxOption(item, callback) {
        let xhr = new XMLHttpRequest();
        let result = null;
        xhr.open('GET', item.dataset.ajax)
        xhr.responseType = 'json';
        xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        xhr.send()
        xhr.onerror = function () {
            console.err('Error: afSelec ajax request failed')
        };

        xhr.onreadystatechange = function () {

            if (xhr.readyState == 3) {
                item.closest('.af-select').querySelector('.select-list').classList.add('select-list--load')
            }

            if (xhr.readyState == 4) {
                item.closest('.af-select').querySelector('.select-list').classList.remove('select-list--load')
            }

        };

        xhr.onload = function () {
            callback(xhr.response)
        };

        return result;
    }

    renderOption(item) {

        var _this = this;
        var select = item.querySelector('select')
        var placeholder = select.getAttribute('placeholder')
        var multiple = select.getAttribute('multiple')

        const styledSelect = document.createElement('div')
        styledSelect.classList.add('select-styled');
        styledSelect.innerHTML = '<span>' + placeholder + '</span>';

        const styledOptions = document.createElement('ul')
        styledOptions.classList.add('select-options');

        const styledList = document.createElement('div')
        styledList.classList.add('select-list');
        styledList.appendChild(styledOptions)

        if (!item.querySelector('.select-styled')) {
            item.appendChild(styledSelect)
        }
        if (!item.querySelector('.select-options')) {
            item.appendChild(styledList)
        }



        function createOptions(item) {
            item.querySelectorAll('select > option').forEach(function (item, index) {

                // create li elem
                const li = document.createElement('li')
                li.innerHTML = item.innerText
                li.setAttribute('rel', item.value)

                if (multiple) {
                    let check = document.createElement('span')
                    check.classList.add('af-check-multiple')
                    li.append(check)
                }

                //если не задан placeholder, сделать им первый элемент
                if (index == 0 && !placeholder) {
                    styledSelect.innerHTML = '<span>' + item.innerText + '</span>';
                }

                //если есть selected элемент
                if (item.getAttribute('selected')) {

                    function selectedText(option) {
                        if (multiple) {

                            let selected_arr = [];

                            option.parentNode.querySelectorAll('option[selected]').forEach(function (item) {
                                selected_arr.push(item.innerText)
                            })

                            return (selected_arr.length ? selected_arr.join(',') : placeholder);
                        } else {
                            return option.innerText
                        }
                    }

                    if (!placeholder) {

                        styledSelect.innerHTML = '<span>' + selectedText(item) + '</span>';
                        li.classList.add('active')
                    } else {
                        styledSelect.innerHTML = '<span class="af-selected-placeholder" data-af-placeholder="' + placeholder + '">' + selectedText(item) + '</span>';
                        li.classList.add('active')
                    }
                }

                if (!item.getAttribute('disabled')) {
                    styledOptions.appendChild(li)
                    _this.clickEventListItem(li, item, index)
                }

            })
        }



        //ajax option
        if (select.dataset.ajax) {

            this.ajaxOption(select, function (arr) {

                select.innerHTML = '';

                let attrSelectedId = select.dataset.selected;
                let arrtPlaceholder = select.getAttribute('placeholder')

                arr.unshift({
                    text: (arrtPlaceholder ? arrtPlaceholder : '-Выберите-'),
                    value: ''
                });

                arr.forEach(function (item) {
                    let option = document.createElement('option')
                    option.value = item.value
                    option.innerText = item.text

                    if (attrSelectedId == item.value) {
                        option.setAttribute('selected', true)
                        select.removeAttribute('data-selected')
                    }

                    select.append(option)
                })

                createOptions(item);
            })

        }

        //default
        if (!select.dataset.ajax) {
            createOptions(item)
        }


        //add public methods

        select['afSelect'] = new Object;
        select.afSelect.open = function () {
            _this.openSelect(item)
        }
        select.afSelect.close = function () {
            _this.closeSelect()
        }
        select.afSelect.update = function () {
            _this.reinit(select)
        }

        //console.log(select)
    }

    renderTemplate() {

        const _this = this;

        this.selectAll.forEach(function (item, index) {



            if (!item.classList.contains('select-hidden')) {
                item.classList.add('select-hidden');
                const wrapper = document.createElement('div');
                wrapper.classList.add('af-select');

                if (item.getAttribute('multiple')) {
                    wrapper.classList.add('af-select--multiple');
                }

                wrapper.innerHTML = item.outerHTML;
                item.parentNode.replaceChild(wrapper, item);

                //add event 
                _this.clickEventOpenSelect(wrapper)
            }

        })

        document.querySelectorAll('.af-select').forEach(function (item, index) {
            _this.renderOption(item)
        })


    }

    openSelect(elem) {
        //close all open select 
        document.querySelectorAll('select').forEach(function (select) {
            if (select.afSelect) select.afSelect.close()
        })

        if (elem.querySelector('select').dataset.ajax && !elem.querySelector('.select-styled').classList.contains('active')) {
            elem.querySelector('.select-list').remove()
            this.renderOption(elem);
        }

        elem.style.maxWidth = (elem.offsetWidth) + 'px'
        elem.querySelector('.select-styled').classList.toggle('active')
        elem.querySelector('.select-options').classList.toggle('active')
        elem.querySelector('.select-list').classList.toggle('active')
        document.querySelector('body').classList.toggle('af-select-open')
    }

    closeSelect() {

        if (!document.querySelector('.select-styled.active')) return false

        document.querySelector('.select-styled.active').classList.remove('active')
        document.querySelector('.select-options.active').classList.remove('active')
        document.querySelector('.select-list.active').classList.remove('active')
        document.querySelector('body').classList.remove('af-select-open')
    }

    clickEventOut() {
        const _this = this;
        document.addEventListener('click', function () {
            _this.closeSelect()
        })
    }

    clickEventListItem(elem, option, index) {

        const parentElem = option.parentNode.parentNode
        const _this = this;
        const placeholder = parentElem.querySelector('select').getAttribute('placeholder')
        const multiple = parentElem.querySelector('select').getAttribute('multiple')
        const styledSelect = parentElem.querySelector('.select-styled')


        elem.addEventListener('click', function (event) {

            event.stopPropagation()
            event.preventDefault()
            //console.log(options)

            if (parentElem.querySelector('.select-options li.active')) {

                // если мульти то не сбрасывать active
                if (!multiple) {
                    parentElem.querySelector('.select-options li.active').classList.remove('active')
                }
            }

            if (this.classList.contains('active')) {
                this.classList.remove('active')
                option.removeAttribute('selected')
            } else {
                this.classList.add('active')
                option.setAttribute('selected', 'selected')
            }

            function selectedText(option) {
                if (multiple) {

                    let selected_arr = [];

                    option.parentNode.querySelectorAll('option[selected]').forEach(function (item) {
                        selected_arr.push(item.innerText)
                    })

                    return (selected_arr.length ? selected_arr.join(',') : placeholder);
                } else {
                    return option.innerText
                }
            }

            //если есть placeholder
            if (placeholder) {
                styledSelect.innerHTML = '<span class="af-selected-placeholder" data-af-placeholder="' + placeholder + '">' + selectedText(option) + '</span>';
            } else {
                parentElem.querySelector('.select-styled span').innerHTML = selectedText(option)
            }

            parentElem.querySelector('select').value = this.getAttribute('rel')
            var dispatchEvent = new Event('change');
            parentElem.querySelector('select').dispatchEvent(dispatchEvent);

            if (!event.target.classList.contains('af-check-multiple')) {
                _this.closeSelect()
            }




        })
    }

    clickEventOpenSelect(elem) {
        const _this = this;

        function addEventOpen(event) {
            event.stopPropagation()
            event.preventDefault()
            _this.openSelect(this)
        }

        elem.removeEventListener('click', addEventOpen)
        elem.addEventListener('click', addEventOpen)
    }

}

!function(e){var t=function(u,D,f){"use strict";var k,H;if(function(){var e;var t={lazyClass:"lazyload",loadedClass:"lazyloaded",loadingClass:"lazyloading",preloadClass:"lazypreload",errorClass:"lazyerror",autosizesClass:"lazyautosizes",fastLoadedClass:"ls-is-cached",iframeLoadMode:0,srcAttr:"data-src",srcsetAttr:"data-srcset",sizesAttr:"data-sizes",minSize:40,customMedia:{},init:true,expFactor:1.5,hFac:.8,loadMode:2,loadHidden:true,ricTimeout:0,throttleDelay:125};H=u.lazySizesConfig||u.lazysizesConfig||{};for(e in t){if(!(e in H)){H[e]=t[e]}}}(),!D||!D.getElementsByClassName){return{init:function(){},cfg:H,noSupport:true}}var O=D.documentElement,i=u.HTMLPictureElement,P="addEventListener",$="getAttribute",q=u[P].bind(u),I=u.setTimeout,U=u.requestAnimationFrame||I,o=u.requestIdleCallback,j=/^picture$/i,r=["load","error","lazyincluded","_lazyloaded"],a={},G=Array.prototype.forEach,J=function(e,t){if(!a[t]){a[t]=new RegExp("(\\s|^)"+t+"(\\s|$)")}return a[t].test(e[$]("class")||"")&&a[t]},K=function(e,t){if(!J(e,t)){e.setAttribute("class",(e[$]("class")||"").trim()+" "+t)}},Q=function(e,t){var a;if(a=J(e,t)){e.setAttribute("class",(e[$]("class")||"").replace(a," "))}},V=function(t,a,e){var i=e?P:"removeEventListener";if(e){V(t,a)}r.forEach(function(e){t[i](e,a)})},X=function(e,t,a,i,r){var n=D.createEvent("Event");if(!a){a={}}a.instance=k;n.initEvent(t,!i,!r);n.detail=a;e.dispatchEvent(n);return n},Y=function(e,t){var a;if(!i&&(a=u.picturefill||H.pf)){if(t&&t.src&&!e[$]("srcset")){e.setAttribute("srcset",t.src)}a({reevaluate:true,elements:[e]})}else if(t&&t.src){e.src=t.src}},Z=function(e,t){return(getComputedStyle(e,null)||{})[t]},s=function(e,t,a){a=a||e.offsetWidth;while(a<H.minSize&&t&&!e._lazysizesWidth){a=t.offsetWidth;t=t.parentNode}return a},ee=function(){var a,i;var t=[];var r=[];var n=t;var s=function(){var e=n;n=t.length?r:t;a=true;i=false;while(e.length){e.shift()()}a=false};var e=function(e,t){if(a&&!t){e.apply(this,arguments)}else{n.push(e);if(!i){i=true;(D.hidden?I:U)(s)}}};e._lsFlush=s;return e}(),te=function(a,e){return e?function(){ee(a)}:function(){var e=this;var t=arguments;ee(function(){a.apply(e,t)})}},ae=function(e){var a;var i=0;var r=H.throttleDelay;var n=H.ricTimeout;var t=function(){a=false;i=f.now();e()};var s=o&&n>49?function(){o(t,{timeout:n});if(n!==H.ricTimeout){n=H.ricTimeout}}:te(function(){I(t)},true);return function(e){var t;if(e=e===true){n=33}if(a){return}a=true;t=r-(f.now()-i);if(t<0){t=0}if(e||t<9){s()}else{I(s,t)}}},ie=function(e){var t,a;var i=99;var r=function(){t=null;e()};var n=function(){var e=f.now()-a;if(e<i){I(n,i-e)}else{(o||r)(r)}};return function(){a=f.now();if(!t){t=I(n,i)}}},e=function(){var v,m,c,h,e;var y,z,g,p,C,b,A;var n=/^img$/i;var d=/^iframe$/i;var E="onscroll"in u&&!/(gle|ing)bot/.test(navigator.userAgent);var _=0;var w=0;var M=0;var N=-1;var L=function(e){M--;if(!e||M<0||!e.target){M=0}};var x=function(e){if(A==null){A=Z(D.body,"visibility")=="hidden"}return A||!(Z(e.parentNode,"visibility")=="hidden"&&Z(e,"visibility")=="hidden")};var W=function(e,t){var a;var i=e;var r=x(e);g-=t;b+=t;p-=t;C+=t;while(r&&(i=i.offsetParent)&&i!=D.body&&i!=O){r=(Z(i,"opacity")||1)>0;if(r&&Z(i,"overflow")!="visible"){a=i.getBoundingClientRect();r=C>a.left&&p<a.right&&b>a.top-1&&g<a.bottom+1}}return r};var t=function(){var e,t,a,i,r,n,s,o,l,u,f,c;var d=k.elements;if((h=H.loadMode)&&M<8&&(e=d.length)){t=0;N++;for(;t<e;t++){if(!d[t]||d[t]._lazyRace){continue}if(!E||k.prematureUnveil&&k.prematureUnveil(d[t])){R(d[t]);continue}if(!(o=d[t][$]("data-expand"))||!(n=o*1)){n=w}if(!u){u=!H.expand||H.expand<1?O.clientHeight>500&&O.clientWidth>500?500:370:H.expand;k._defEx=u;f=u*H.expFactor;c=H.hFac;A=null;if(w<f&&M<1&&N>2&&h>2&&!D.hidden){w=f;N=0}else if(h>1&&N>1&&M<6){w=u}else{w=_}}if(l!==n){y=innerWidth+n*c;z=innerHeight+n;s=n*-1;l=n}a=d[t].getBoundingClientRect();if((b=a.bottom)>=s&&(g=a.top)<=z&&(C=a.right)>=s*c&&(p=a.left)<=y&&(b||C||p||g)&&(H.loadHidden||x(d[t]))&&(m&&M<3&&!o&&(h<3||N<4)||W(d[t],n))){R(d[t]);r=true;if(M>9){break}}else if(!r&&m&&!i&&M<4&&N<4&&h>2&&(v[0]||H.preloadAfterLoad)&&(v[0]||!o&&(b||C||p||g||d[t][$](H.sizesAttr)!="auto"))){i=v[0]||d[t]}}if(i&&!r){R(i)}}};var a=ae(t);var S=function(e){var t=e.target;if(t._lazyCache){delete t._lazyCache;return}L(e);K(t,H.loadedClass);Q(t,H.loadingClass);V(t,B);X(t,"lazyloaded")};var i=te(S);var B=function(e){i({target:e.target})};var T=function(e,t){var a=e.getAttribute("data-load-mode")||H.iframeLoadMode;if(a==0){e.contentWindow.location.replace(t)}else if(a==1){e.src=t}};var F=function(e){var t;var a=e[$](H.srcsetAttr);if(t=H.customMedia[e[$]("data-media")||e[$]("media")]){e.setAttribute("media",t)}if(a){e.setAttribute("srcset",a)}};var s=te(function(t,e,a,i,r){var n,s,o,l,u,f;if(!(u=X(t,"lazybeforeunveil",e)).defaultPrevented){if(i){if(a){K(t,H.autosizesClass)}else{t.setAttribute("sizes",i)}}s=t[$](H.srcsetAttr);n=t[$](H.srcAttr);if(r){o=t.parentNode;l=o&&j.test(o.nodeName||"")}f=e.firesLoad||"src"in t&&(s||n||l);u={target:t};K(t,H.loadingClass);if(f){clearTimeout(c);c=I(L,2500);V(t,B,true)}if(l){G.call(o.getElementsByTagName("source"),F)}if(s){t.setAttribute("srcset",s)}else if(n&&!l){if(d.test(t.nodeName)){T(t,n)}else{t.src=n}}if(r&&(s||l)){Y(t,{src:n})}}if(t._lazyRace){delete t._lazyRace}Q(t,H.lazyClass);ee(function(){var e=t.complete&&t.naturalWidth>1;if(!f||e){if(e){K(t,H.fastLoadedClass)}S(u);t._lazyCache=true;I(function(){if("_lazyCache"in t){delete t._lazyCache}},9)}if(t.loading=="lazy"){M--}},true)});var R=function(e){if(e._lazyRace){return}var t;var a=n.test(e.nodeName);var i=a&&(e[$](H.sizesAttr)||e[$]("sizes"));var r=i=="auto";if((r||!m)&&a&&(e[$]("src")||e.srcset)&&!e.complete&&!J(e,H.errorClass)&&J(e,H.lazyClass)){return}t=X(e,"lazyunveilread").detail;if(r){re.updateElem(e,true,e.offsetWidth)}e._lazyRace=true;M++;s(e,t,r,i,a)};var r=ie(function(){H.loadMode=3;a()});var o=function(){if(H.loadMode==3){H.loadMode=2}r()};var l=function(){if(m){return}if(f.now()-e<999){I(l,999);return}m=true;H.loadMode=3;a();q("scroll",o,true)};return{_:function(){e=f.now();k.elements=D.getElementsByClassName(H.lazyClass);v=D.getElementsByClassName(H.lazyClass+" "+H.preloadClass);q("scroll",a,true);q("resize",a,true);q("pageshow",function(e){if(e.persisted){var t=D.querySelectorAll("."+H.loadingClass);if(t.length&&t.forEach){U(function(){t.forEach(function(e){if(e.complete){R(e)}})})}}});if(u.MutationObserver){new MutationObserver(a).observe(O,{childList:true,subtree:true,attributes:true})}else{O[P]("DOMNodeInserted",a,true);O[P]("DOMAttrModified",a,true);setInterval(a,999)}q("hashchange",a,true);["focus","mouseover","click","load","transitionend","animationend"].forEach(function(e){D[P](e,a,true)});if(/d$|^c/.test(D.readyState)){l()}else{q("load",l);D[P]("DOMContentLoaded",a);I(l,2e4)}if(k.elements.length){t();ee._lsFlush()}else{a()}},checkElems:a,unveil:R,_aLSL:o}}(),re=function(){var a;var n=te(function(e,t,a,i){var r,n,s;e._lazysizesWidth=i;i+="px";e.setAttribute("sizes",i);if(j.test(t.nodeName||"")){r=t.getElementsByTagName("source");for(n=0,s=r.length;n<s;n++){r[n].setAttribute("sizes",i)}}if(!a.detail.dataAttr){Y(e,a.detail)}});var i=function(e,t,a){var i;var r=e.parentNode;if(r){a=s(e,r,a);i=X(e,"lazybeforesizes",{width:a,dataAttr:!!t});if(!i.defaultPrevented){a=i.detail.width;if(a&&a!==e._lazysizesWidth){n(e,r,i,a)}}}};var e=function(){var e;var t=a.length;if(t){e=0;for(;e<t;e++){i(a[e])}}};var t=ie(e);return{_:function(){a=D.getElementsByClassName(H.autosizesClass);q("resize",t)},checkElems:t,updateElem:i}}(),t=function(){if(!t.i&&D.getElementsByClassName){t.i=true;re._();e._()}};return I(function(){H.init&&t()}),k={cfg:H,autoSizer:re,loader:e,init:t,uP:Y,aC:K,rC:Q,hC:J,fire:X,gW:s,rAF:ee}}(e,e.document,Date);e.lazySizes=t,"object"==typeof module&&module.exports&&(module.exports=t)}("undefined"!=typeof window?window:{});
//add simple support for background images:
document.addEventListener('lazybeforeunveil', function(e){ var bg = e.target.getAttribute('data-bg');
    if(bg){  e.target.style.backgroundImage = 'url(' + bg + ')'; }
});
/*!
 * maska v1.5.0
 * (c) 2019-2021 Alexander Shabunevich
 * Released under the MIT License.
 */
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).Maska={})}(this,(function(e){"use strict";function t(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function n(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var s={"#":{pattern:/[0-9]/},X:{pattern:/[0-9a-zA-Z]/},S:{pattern:/[a-zA-Z]/},A:{pattern:/[a-zA-Z]/,uppercase:!0},a:{pattern:/[a-zA-Z]/,lowercase:!0},"!":{escape:!0},"*":{repeat:!0}};function i(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:s,r=!(arguments.length>3&&void 0!==arguments[3])||arguments[3];return u(t).length>1?l(t)(e,t,n,r):p(e,t,n,r)}function u(e){try{return JSON.parse(e)}catch(t){return[e]}}function l(e){var t=u(e).sort((function(e,t){return e.length-t.length}));return function(e,r,a){var o=!(arguments.length>3&&void 0!==arguments[3])||arguments[3],s=t.map((function(t){return p(e,t,a,!1)})),i=s.pop();for(var u in t)if(n(i,t[u],a))return p(e,t[u],a,o);return""};function n(e,t,n){for(var r in n)n[r].escape&&(t=t.replace(new RegExp(r+".{1}","g"),""));return t.split("").filter((function(e){return n[e]&&n[e].pattern})).length>=e.length}}function p(e,t,n){for(var r=!(arguments.length>3&&void 0!==arguments[3])||arguments[3],a=0,o=0,s="",i="";a<t.length&&o<e.length;){var u=t[a],l=e[o],p=n[u];if(p&&p.pattern)p.pattern.test(l)&&(s+=c(l,p),a++,r&&t[a]&&(n[t[a]]?n[t[a]]&&n[t[a]].escape&&(s+=t[a+1],a+=2):(s+=t[a],a++))),o++;else if(p&&p.repeat){var f=n[t[a-1]];f&&!f.pattern.test(l)?a++:a--}else p&&p.escape&&(u=t[++a]),r&&(s+=u),l===u&&o++,a++}for(;r&&a<t.length;){var v=t[a];if(n[v]){i="";break}i+=v,a++}return s+i}function c(e,t){return t.transform&&(e=t.transform(e)),t.uppercase?e.toLocaleUpperCase():t.lowercase?e.toLocaleLowerCase():e}function f(e){return e instanceof HTMLInputElement?e:e.querySelector("input")||e}function v(e){return"[object String]"===Object.prototype.toString.call(e)}var d=function(){function e(n){var r=this,a=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if(t(this,e),!n)throw new Error("Maska: no element for mask");if(null!=a.preprocessor&&"function"!=typeof a.preprocessor)throw new Error("Maska: preprocessor must be a function");if(a.tokens)for(var i in a.tokens)a.tokens[i]=o({},a.tokens[i]),a.tokens[i].pattern&&v(a.tokens[i].pattern)&&(a.tokens[i].pattern=new RegExp(a.tokens[i].pattern));this._opts={mask:a.mask,tokens:o(o({},s),a.tokens),preprocessor:a.preprocessor},this._el=v(n)?document.querySelectorAll(n):n.length?n:[n],this.inputEvent=function(e){return r.updateValue(e.target,e)},this.init()}var r,a,u;return r=e,(a=[{key:"init",value:function(){for(var e=this,t=function(t){var n=f(e._el[t]);!e._opts.mask||n.dataset.mask&&n.dataset.mask===e._opts.mask||(n.dataset.mask=e._opts.mask),setTimeout((function(){return e.updateValue(n)}),0),n.dataset.maskInited||(n.dataset.maskInited=!0,n.addEventListener("input",e.inputEvent),n.addEventListener("beforeinput",e.beforeInput))},n=0;n<this._el.length;n++)t(n)}},{key:"destroy",value:function(){for(var e=0;e<this._el.length;e++){var t=f(this._el[e]);t.removeEventListener("input",this.inputEvent),t.removeEventListener("beforeinput",this.beforeInput),delete t.dataset.mask,delete t.dataset.maskInited}}},{key:"updateValue",value:function(e,t){if(e&&e.type){var n=e.type.match(/^number$/i)&&e.validity.badInput;if(!e.value&&!n||!e.dataset.mask)return e.dataset.maskRawValue="",void this.dispatch("maska",e,t);var r=e.selectionEnd,a=e.value,o=a[r-1];e.dataset.maskRawValue=i(e.value,e.dataset.mask,this._opts.tokens,!1);var s=e.value;this._opts.preprocessor&&(s=this._opts.preprocessor(s)),e.value=i(s,e.dataset.mask,this._opts.tokens),t&&"insertText"===t.inputType&&r===a.length&&(r=e.value.length),function(e,t,n){for(;t&&t<e.value.length&&e.value.charAt(t-1)!==n;)t++;(e.type?e.type.match(/^(text|search|password|tel|url)$/i):!e.type)&&e===document.activeElement&&(e.setSelectionRange(t,t),setTimeout((function(){e.setSelectionRange(t,t)}),0))}(e,r,o),this.dispatch("maska",e,t),e.value!==a&&this.dispatch("input",e,t)}}},{key:"beforeInput",value:function(e){e&&e.target&&e.target.type&&e.target.type.match(/^number$/i)&&e.data&&isNaN(e.target.value+e.data)&&e.preventDefault()}},{key:"dispatch",value:function(e,t,n){t.dispatchEvent(function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,n=document.createEvent("Event");return n.initEvent(e,!0,!0),t&&(n.inputType=t),n}(e,n&&n.inputType||null))}}])&&n(r.prototype,a),u&&n(r,u),e}();var h,k=(h=new WeakMap,function(e,t){t.value&&(h.has(e)&&!function(e){return!(v(e.value)&&e.value===e.oldValue||Array.isArray(e.value)&&JSON.stringify(e.value)===JSON.stringify(e.oldValue)||e.value&&e.value.mask&&e.oldValue&&e.oldValue.mask&&e.value.mask===e.oldValue.mask)}(t)||h.set(e,new d(e,function(e){var t={};return e.mask?(t.mask=Array.isArray(e.mask)?JSON.stringify(e.mask):e.mask,t.tokens=e.tokens?o({},e.tokens):{},t.preprocessor=e.preprocessor):t.mask=Array.isArray(e)?JSON.stringify(e):e,t}(t.value))))});function m(e){e.directive("maska",k)}"undefined"!=typeof window&&window.Vue&&window.Vue.use&&window.Vue.use(m),e.create=function(e,t){return new d(e,t)},e.default=m,e.install=m,e.mask=i,e.maska=k,e.tokens=s,Object.defineProperty(e,"__esModule",{value:!0})}));

!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.ymapsTouchScroll=t():e.ymapsTouchScroll=t()}(window,function(){return function(e){var t={};function n(o){if(t[o])return t[o].exports;var r=t[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,n),r.l=!0,r.exports}return n.m=e,n.c=t,n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(o,r,function(t){return e[t]}.bind(null,r));return o},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){"use strict";function o(e){return(o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}n.r(t);t.default=function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=t.preventScroll,r=void 0===n||n,u=t.preventTouch,i=void 0===u||u,c=t.textScroll,f=void 0===c?"Чтобы изменить масштаб, прокручивайте карту, удерживая клавишу Ctrl":c,d=t.textTouch,a=void 0===d?"Чтобы переместить карту проведите по ней двумя пальцами":d;if("undefined"!=typeof window&&"object"===o(e)&&(r||i)&&"string"==typeof f&&"string"==typeof a){var l=/Mobi/i.test(navigator.userAgent)||/Android/i.test(navigator.userAgent),s=e.panes.get("events"),p=s.getElement(),y=l?a:f,b={alignItems:"center",boxSizing:"border-box",color:"#fff",display:"flex",justifyContent:"center",padding:"40px",textAlign:"center",transition:"background .2s",touchAction:"auto"};Object.keys(b).forEach(function(e){p.style[e]=b[e]});var v=function(e){p.style.background="rgba(0, 0, 0, ".concat(e?".6":"0",")"),p.textContent=e?y:""};if(i&&l&&(e.behaviors.disable("drag"),ymaps.domEvent.manager.add(p,"touchmove",function(e){v(1===e.get("touches").length)}),ymaps.domEvent.manager.add(p,"touchend",function(){v(!1)})),r&&!l){var m=function(t){t?e.behaviors.enable("scrollZoom"):e.behaviors.disable("scrollZoom")},g=!1,x=!1;m(!1),s.events.add("wheel",function(){g&&(m(x),v(!x))}),s.events.add("mousedown",function(){v(!1)}),s.events.add("mouseenter",function(){g=!0}),s.events.add("mouseleave",function(){g=!1,v(!1)}),document.addEventListener("keydown",function(e){(x=e.ctrlKey)&&v(!1)}),document.addEventListener("keyup",function(){x=!1})}}}}]).default});