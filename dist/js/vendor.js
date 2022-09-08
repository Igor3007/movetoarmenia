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
function r(n,t){for(var i=0;i<t.length;i++){var r=t[i];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(n,r.key,r)}}function Bt(n,t,i){t&&r(n.prototype,t),i&&r(n,i),Object.defineProperty(n,"prototype",{writable:!1})}
/*!
 * Splide.js
 * Version  : 4.0.14
 * License  : MIT
 * Copyright: 2022 Naotoshi Fujita
 */
var n,t;n=this,t=function(){"use strict";var v="(prefers-reduced-motion: reduce)",G=4,$=5,i={CREATED:1,MOUNTED:2,IDLE:3,MOVING:G,SCROLLING:$,DRAGGING:6,DESTROYED:7};function M(n){n.length=0}function u(n,t,i){return Array.prototype.slice.call(n,t,i)}function D(n){return n.bind.apply(n,[null].concat(u(arguments,1)))}function nn(){}var p=setTimeout;function h(n){requestAnimationFrame(n)}function r(n,t){return typeof t===n}function tn(n){return!e(n)&&r("object",n)}var o=Array.isArray,E=D(r,"function"),P=D(r,"string"),rn=D(r,"undefined");function e(n){return null===n}function y(n){return n instanceof HTMLElement}function g(n){return o(n)?n:[n]}function m(n,t){g(n).forEach(t)}function b(n,t){return-1<n.indexOf(t)}function S(n,t){return n.push.apply(n,g(t)),n}function A(t,n,i){t&&m(n,function(n){n&&t.classList[i?"add":"remove"](n)})}function z(n,t){A(n,P(t)?t.split(" "):t,!0)}function L(n,t){m(t,n.appendChild.bind(n))}function un(n,i){m(n,function(n){var t=(i||n).parentNode;t&&t.insertBefore(n,i)})}function on(n,t){return y(n)&&(n.msMatchesSelector||n.matches).call(n,t)}function en(n,t){n=n?u(n.children):[];return t?n.filter(function(n){return on(n,t)}):n}function cn(n,t){return t?en(n,t)[0]:n.firstElementChild}var fn=Object.keys;function w(n,t,i){if(n)for(var r=fn(n),r=i?r.reverse():r,u=0;u<r.length;u++){var o=r[u];if("__proto__"!==o&&!1===t(n[o],o))break}}function an(r){return u(arguments,1).forEach(function(i){w(i,function(n,t){r[t]=i[t]})}),r}function d(i){return u(arguments,1).forEach(function(n){w(n,function(n,t){o(n)?i[t]=n.slice():tn(n)?i[t]=d({},tn(i[t])?i[t]:{},n):i[t]=n})}),i}function sn(t,n){g(n||fn(t)).forEach(function(n){delete t[n]})}function I(n,i){m(n,function(t){m(i,function(n){t&&t.removeAttribute(n)})})}function R(i,t,r){tn(t)?w(t,function(n,t){R(i,t,n)}):m(i,function(n){e(r)||""===r?I(n,t):n.setAttribute(t,String(r))})}function C(n,t,i){n=document.createElement(n);return t&&(P(t)?z:R)(n,t),i&&L(i,n),n}function O(n,t,i){if(rn(i))return getComputedStyle(n)[t];e(i)||(n.style[t]=""+i)}function ln(n,t){O(n,"display",t)}function dn(n){n.setActive&&n.setActive()||n.focus({preventScroll:!0})}function T(n,t){return n.getAttribute(t)}function vn(n,t){return n&&n.classList.contains(t)}function j(n){return n.getBoundingClientRect()}function N(n){m(n,function(n){n&&n.parentNode&&n.parentNode.removeChild(n)})}function hn(n){return cn((new DOMParser).parseFromString(n,"text/html").body)}function F(n,t){n.preventDefault(),t&&(n.stopPropagation(),n.stopImmediatePropagation())}function pn(n,t){return n&&n.querySelector(t)}function gn(n,t){return t?u(n.querySelectorAll(t)):[]}function W(n,t){A(n,t,!1)}function mn(n){return n.timeStamp}function x(n){return P(n)?n:n?n+"px":""}var _="splide",c="data-"+_;function yn(n,t){if(!n)throw new Error("["+_+"] "+(t||""))}var X=Math.min,bn=Math.max,wn=Math.floor,_n=Math.ceil,Y=Math.abs;function xn(n,t,i){return Y(n-t)<i}function kn(n,t,i,r){var u=X(t,i),t=bn(t,i);return r?u<n&&n<t:u<=n&&n<=t}function En(n,t,i){var r=X(t,i),t=bn(t,i);return X(bn(r,n),t)}function Sn(n){return(0<n)-(n<0)}function Ln(t,n){return m(n,function(n){t=t.replace("%s",""+n)}),t}function An(n){return n<10?"0"+n:""+n}var On={};function Mn(){var c=[];function i(n,i,r){m(n,function(t){t&&m(i,function(n){n.split(" ").forEach(function(n){n=n.split(".");r(t,n[0],n[1])})})})}return{bind:function(n,t,o,e){i(n,t,function(n,t,i){var r="addEventListener"in n,u=r?n.removeEventListener.bind(n,t,o,e):n.removeListener.bind(n,o);r?n.addEventListener(t,o,e):n.addListener(o),c.push([n,t,i,o,u])})},unbind:function(n,t,u){i(n,t,function(t,i,r){c=c.filter(function(n){return!!(n[0]!==t||n[1]!==i||n[2]!==r||u&&n[3]!==u)||(n[4](),!1)})})},dispatch:function(n,t,i){var r;return"function"==typeof CustomEvent?r=new CustomEvent(t,{bubbles:!0,detail:i}):(r=document.createEvent("CustomEvent")).initCustomEvent(t,!0,!1,i),n.dispatchEvent(r),r},destroy:function(){c.forEach(function(n){n[4]()}),M(c)}}}var H="mounted",U="move",Dn="moved",Pn="shifted",zn="click",In="active",Rn="inactive",Cn="visible",Tn="hidden",jn="slide:keydown",q="refresh",B="updated",k="resize",Nn="resized",Gn="scroll",J="scrolled",f="destroy",Fn="navigation:mounted",Wn="autoplay:play",Xn="autoplay:pause",Yn="lazyload:loaded";function K(n){var i=n?n.event.bus:document.createDocumentFragment(),r=Mn();return n&&n.event.on(f,r.destroy),an(r,{bus:i,on:function(n,t){r.bind(i,g(n).join(" "),function(n){t.apply(t,o(n.detail)?n.detail:[])})},off:D(r.unbind,i),emit:function(n){r.dispatch(i,n,u(arguments,1))}})}function Hn(t,n,i,r){var u,o,e=Date.now,c=0,f=!0,a=0;function s(){if(!f){if(c=t?X((e()-u)/t,1):1,i&&i(c),1<=c&&(n(),u=e(),r&&++a>=r))return l();h(s)}}function l(){f=!0}function d(){o&&cancelAnimationFrame(o),f=!(o=c=0)}return{start:function(n){n||d(),u=e()-(n?c*t:0),f=!1,h(s)},rewind:function(){u=e(),c=0,i&&i(c)},pause:l,cancel:d,set:function(n){t=n},isPaused:function(){return f}}}function a(n){var t=n;return{set:function(n){t=n},is:function(n){return b(g(n),t)}}}var n="Arrow",Un=n+"Left",qn=n+"Right",s=n+"Up",n=n+"Down",Bn="ttb",l={width:["height"],left:["top","right"],right:["bottom","left"],x:["y"],X:["Y"],Y:["X"],ArrowLeft:[s,qn],ArrowRight:[n,Un]};var V="role",Jn="tabindex",t="aria-",Kn=t+"controls",Vn=t+"current",Qn=t+"selected",Q=t+"label",Zn=t+"labelledby",$n=t+"hidden",nt=t+"orientation",tt=t+"roledescription",it=t+"live",rt=t+"busy",ut=t+"atomic",ot=[V,Jn,"disabled",Kn,Vn,Q,Zn,$n,nt,tt],et=_,ct=_+"__track",ft=_+"__list",at=_+"__slide",st=at+"--clone",lt=at+"__container",dt=_+"__arrows",vt=_+"__arrow",ht=vt+"--prev",pt=vt+"--next",gt=_+"__pagination",mt=gt+"__page",yt=_+"__progress"+"__bar",bt=_+"__toggle",wt=_+"__sr",Z="is-active",_t="is-prev",xt="is-next",kt="is-visible",Et="is-loading",St="is-focus-in",Lt=[Z,kt,_t,xt,Et,St];var At="touchstart mousedown",Ot="touchmove mousemove",Mt="touchend touchcancel mouseup click";var Dt="slide",Pt="loop",zt="fade";function It(u,r,t,o){var e,n=K(u),i=n.on,c=n.emit,f=n.bind,a=u.Components,s=u.root,l=u.options,d=l.isNavigation,v=l.updateOnMove,h=l.i18n,p=l.pagination,g=l.slideFocus,m=a.Direction.resolve,y=T(o,"style"),b=T(o,Q),w=-1<t,_=cn(o,"."+lt);function x(){var n=u.splides.map(function(n){n=n.splide.Components.Slides.getAt(r);return n?n.slide.id:""}).join(" ");R(o,Q,Ln(h.slideX,(w?t:r)+1)),R(o,Kn,n),R(o,V,g?"button":""),g&&I(o,tt)}function k(){e||E()}function E(){var n,t,i;e||(n=u.index,(i=S())!==vn(o,Z)&&(A(o,Z,i),R(o,Vn,d&&i||""),c(i?In:Rn,L)),i=function(){if(u.is(zt))return S();var n=j(a.Elements.track),t=j(o),i=m("left",!0),r=m("right",!0);return wn(n[i])<=_n(t[i])&&wn(t[r])<=_n(n[r])}(),t=!i&&(!S()||w),u.state.is([G,$])||R(o,$n,t||""),R(gn(o,l.focusableNodes||""),Jn,t?-1:""),g&&R(o,Jn,t?-1:0),i!==vn(o,kt)&&(A(o,kt,i),c(i?Cn:Tn,L)),i||document.activeElement!==o||(t=a.Slides.getAt(u.index))&&dn(t.slide),A(o,_t,r===n-1),A(o,xt,r===n+1))}function S(){var n=u.index;return n===r||l.cloneStatus&&n===t}var L={index:r,slideIndex:t,slide:o,container:_,isClone:w,mount:function(){w||(o.id=s.id+"-slide"+An(r+1),R(o,V,p?"tabpanel":"group"),R(o,tt,h.slide),R(o,Q,b||Ln(h.slideLabel,[r+1,u.length]))),f(o,"click",D(c,zn,L)),f(o,"keydown",D(c,jn,L)),i([Dn,Pn,J],E),i(Fn,x),v&&i(U,k)},destroy:function(){e=!0,n.destroy(),W(o,Lt),I(o,ot),R(o,"style",y),R(o,Q,b||"")},update:E,style:function(n,t,i){O(i&&_||o,n,t)},isWithin:function(n,t){return n=Y(n-r),(n=w||!l.rewind&&!u.is(Pt)?n:X(n,u.length-n))<=t}};return L}var Rt=c+"-interval";var Ct={passive:!1,capture:!0};var Tt={Spacebar:" ",Right:qn,Left:Un,Up:s,Down:n};function jt(n){return n=P(n)?n:n.key,Tt[n]||n}var Nt="keydown";var Gt=c+"-lazy",Ft=Gt+"-srcset",Wt="["+Gt+"], ["+Ft+"]";var Xt=[" ","Enter"];var Yt=Object.freeze({__proto__:null,Media:function(r,n,u){var o=r.state,t=u.breakpoints||{},e=u.reducedMotion||{},i=Mn(),c=[];function f(n){n&&i.destroy()}function a(n,t){t=matchMedia(t);i.bind(t,"change",s),c.push([n,t])}function s(){var n=o.is(7),t=u.direction,i=c.reduce(function(n,t){return d(n,t[1].matches?t[0]:{})},{});sn(u),l(i),u.destroy?r.destroy("completely"===u.destroy):n?(f(!0),r.mount()):t!==u.direction&&r.refresh()}function l(n,t){d(u,n),t&&d(Object.getPrototypeOf(u),n),o.is(1)||r.emit(B,u)}return{setup:function(){var i="min"===u.mediaQuery;fn(t).sort(function(n,t){return i?+n-+t:+t-+n}).forEach(function(n){a(t[n],"("+(i?"min":"max")+"-width:"+n+"px)")}),a(e,v),s()},destroy:f,reduce:function(n){matchMedia(v).matches&&(n?d(u,e):sn(u,fn(e)))},set:l}},Direction:function(n,t,u){return{resolve:function(n,t,i){var r="rtl"!==(i=i||u.direction)||t?i===Bn?0:-1:1;return l[n]&&l[n][r]||n.replace(/width|left|right/i,function(n,t){n=l[n.toLowerCase()][r]||n;return 0<t?n.charAt(0).toUpperCase()+n.slice(1):n})},orient:function(n){return n*("rtl"===u.direction?1:-1)}}},Elements:function(n,t,i){var r,u,o,e=K(n),c=e.on,f=e.bind,a=n.root,s=i.i18n,l={},d=[],v=[],h=[];function p(){r=y("."+ct),u=cn(r,"."+ft),yn(r&&u,"A track/list element is missing."),S(d,en(u,"."+at+":not(."+st+")")),w({arrows:dt,pagination:gt,prev:ht,next:pt,bar:yt,toggle:bt},function(n,t){l[t]=y("."+n)}),an(l,{root:a,track:r,list:u,slides:d});var n=a.id||function(n){return""+n+An(On[n]=(On[n]||0)+1)}(_),t=i.role;a.id=n,r.id=r.id||n+"-track",u.id=u.id||n+"-list",!T(a,V)&&"SECTION"!==a.tagName&&t&&R(a,V,t),R(a,tt,s.carousel),R(u,V,"presentation"),m()}function g(n){var t=ot.concat("style");M(d),W(a,v),W(r,h),I([r,u],t),I(a,n?t:["style",tt])}function m(){W(a,v),W(r,h),v=b(et),h=b(ct),z(a,v),z(r,h),R(a,Q,i.label),R(a,Zn,i.labelledby)}function y(n){n=pn(a,n);return n&&function(n,t){if(E(n.closest))return n.closest(t);for(var i=n;i&&1===i.nodeType&&!on(i,t);)i=i.parentElement;return i}(n,"."+et)===a?n:void 0}function b(n){return[n+"--"+i.type,n+"--"+i.direction,i.drag&&n+"--draggable",i.isNavigation&&n+"--nav",n===et&&Z]}return an(l,{setup:p,mount:function(){c(q,g),c(q,p),c(B,m),f(document,At+" keydown",function(n){o="keydown"===n.type},{capture:!0}),f(a,"focusin",function(){A(a,St,!!o)})},destroy:g})},Slides:function(r,u,o){var n=K(r),t=n.on,e=n.emit,c=n.bind,f=(n=u.Elements).slides,a=n.list,s=[];function i(){f.forEach(function(n,t){d(n,t,-1)})}function l(){h(function(n){n.destroy()}),M(s)}function d(n,t,i){t=It(r,t,i,n);t.mount(),s.push(t)}function v(n){return n?p(function(n){return!n.isClone}):s}function h(n,t){v(t).forEach(n)}function p(t){return s.filter(E(t)?t:function(n){return P(t)?on(n.slide,t):b(g(t),n.index)})}return{mount:function(){i(),t(q,l),t(q,i),t([H,q],function(){s.sort(function(n,t){return n.index-t.index})})},destroy:l,update:function(){h(function(n){n.update()})},register:d,get:v,getIn:function(n){var t=u.Controller,i=t.toIndex(n),r=t.hasFocus()?1:o.perPage;return p(function(n){return kn(n.index,i,i+r-1)})},getAt:function(n){return p(n)[0]},add:function(n,u){m(n,function(n){var t,i,r;y(n=P(n)?hn(n):n)&&((t=f[u])?un(n,t):L(a,n),z(n,o.classes.slide),t=n,i=D(e,k),t=gn(t,"img"),(r=t.length)?t.forEach(function(n){c(n,"load error",function(){--r||i()})}):i())}),e(q)},remove:function(n){N(p(n).map(function(n){return n.slide})),e(q)},forEach:h,filter:p,style:function(t,i,r){h(function(n){n.style(t,i,r)})},getLength:function(n){return(n?f:s).length},isEnough:function(){return s.length>o.perPage}}},Layout:function(n,t,i){var r,u,o=(f=K(n)).on,e=f.bind,c=f.emit,f=t.Slides,a=t.Direction.resolve,s=(t=t.Elements).root,l=t.track,d=t.list,v=f.getAt,h=f.style;function p(){u=null,r=i.direction===Bn,O(s,"maxWidth",x(i.width)),O(l,a("paddingLeft"),m(!1)),O(l,a("paddingRight"),m(!0)),g()}function g(){var n=j(s);u&&u.width===n.width&&u.height===n.height||(O(l,"height",function(){var n="";r&&(yn(n=y(),"height or heightRatio is missing."),n="calc("+n+" - "+m(!1)+" - "+m(!0)+")");return n}()),h(a("marginRight"),x(i.gap)),h("width",i.autoWidth?null:x(i.fixedWidth)||(r?"":b())),h("height",x(i.fixedHeight)||(r?i.autoHeight?null:b():y()),!0),u=n,c(Nn))}function m(n){var t=i.padding,n=a(n?"right":"left");return t&&x(t[n]||(tn(t)?0:t))||"0px"}function y(){return x(i.height||j(d).width*i.heightRatio)}function b(){var n=x(i.gap);return"calc((100%"+(n&&" + "+n)+")/"+(i.perPage||1)+(n&&" - "+n)+")"}function w(n,t){var i,n=v(n);return n?(n=j(n.slide)[a("right")],i=j(d)[a("left")],Y(n-i)+(t?0:_())):0}function _(){var n=v(0);return n&&parseFloat(O(n.slide,a("marginRight")))||0}return{mount:function(){var n,t,i;p(),e(window,"resize load",(n=D(c,k),function(){i||(i=Hn(t||0,function(){n(),i=null},null,1)).start()})),o([B,q],p),o(k,g)},listSize:function(){return j(d)[a("width")]},slideSize:function(n,t){return(n=v(n||0))?j(n.slide)[a("width")]+(t?0:_()):0},sliderSize:function(){return w(n.length-1,!0)-w(-1,!0)},totalSize:w,getPadding:function(n){return parseFloat(O(l,a("padding"+(n?"Right":"Left"))))||0}}},Clones:function(c,i,f){var n,t=K(c),r=t.on,a=t.emit,s=i.Elements,l=i.Slides,u=i.Direction.resolve,d=[];function o(){if(n=h()){var u=n,o=l.get().slice(),e=o.length;if(e){for(;o.length<u;)S(o,o);S(o.slice(-u),o.slice(0,u)).forEach(function(n,t){var i=t<u,r=function(n,t){n=n.cloneNode(!0);return z(n,f.classes.clone),n.id=c.root.id+"-clone"+An(t+1),n}(n.slide,t);i?un(r,o[0].slide):L(s.list,r),S(d,r),l.register(r,t-u+(i?0:e),n.index)})}a(k)}}function e(){N(d),M(d)}function v(){n<h()&&a(q)}function h(){var n,t=f.clones;return c.is(Pt)?t||(t=(n=f[u("fixedWidth")]&&i.Layout.slideSize(0))&&_n(j(s.track)[u("width")]/n)||f[u("autoWidth")]&&c.length||2*f.perPage):t=0,t}return{mount:function(){o(),r(q,e),r(q,o),r([B,k],v)},destroy:e}},Move:function(r,c,u){var e,n=K(r),t=n.on,f=n.emit,a=r.state.set,o=(n=c.Layout).slideSize,i=n.getPadding,s=n.totalSize,l=n.listSize,d=n.sliderSize,v=(n=c.Direction).resolve,h=n.orient,p=(n=c.Elements).list,g=n.track;function m(){c.Controller.isBusy()||(c.Scroll.cancel(),y(r.index),c.Slides.update())}function y(n){b(k(n,!0))}function b(n,t){r.is(zt)||(t=t?n:function(n){{var t,i;r.is(Pt)&&(t=x(n),i=t>c.Controller.getEnd(),(t<0||i)&&(n=w(n,i)))}return n}(n),O(p,"transform","translate"+v("X")+"("+t+"px)"),n!==t&&f(Pn))}function w(n,t){var i=n-S(t),r=d();return n-=h(r*(_n(Y(i)/r)||1))*(t?1:-1)}function _(){b(E()),e.cancel()}function x(n){for(var t=c.Slides.get(),i=0,r=1/0,u=0;u<t.length;u++){var o=t[u].index,e=Y(k(o,!0)-n);if(!(e<=r))break;r=e,i=o}return i}function k(n,t){var i=h(s(n-1)-(n=n,"center"===(i=u.focus)?(l()-o(n,!0))/2:+i*o(n)||0));return t?(n=i,n=u.trimSpace&&r.is(Dt)?En(n,0,h(d()-l())):n):i}function E(){var n=v("left");return j(p)[n]-j(g)[n]+h(i(!1))}function S(n){return k(n?c.Controller.getEnd():0,!!u.trimSpace)}return{mount:function(){e=c.Transition,t([H,Nn,B,q],m)},move:function(n,t,i,r){var u,o;n!==t&&(u=i<n,o=h(w(E(),u)),u?0<=o:o<=p[v("scrollWidth")]-j(g)[v("width")])&&(_(),b(w(E(),i<n),!0)),a(G),f(U,t,i,n),e.start(t,function(){a(3),f(Dn,t,i,n),r&&r()})},jump:y,translate:b,shift:w,cancel:_,toIndex:x,toPosition:k,getPosition:E,getLimit:S,exceededLimit:function(n,t){t=rn(t)?E():t;var i=!0!==n&&h(t)<h(S(!1)),n=!1!==n&&h(t)>h(S(!0));return i||n},reposition:m}},Controller:function(o,u,e){var c,f,a,n=K(o).on,s=u.Move,l=s.getPosition,r=s.getLimit,d=s.toPosition,t=u.Slides,v=t.isEnough,i=t.getLength,h=o.is(Pt),p=o.is(Dt),g=D(_,!1),m=D(_,!0),y=e.start||0,b=y;function w(){c=i(!0),f=e.perMove,a=e.perPage;var n=En(y,0,c-1);n!==y&&(y=n,s.reposition())}function _(n,t){var i=f||(O()?1:a),i=x(y+i*(n?-1:1),y,!(f||O()));return-1===i&&p&&!xn(l(),r(!n),1)?n?0:E():t?i:k(i)}function x(n,t,i){var r,u;return v()||O()?(r=E(),(u=function(n){if(p&&"move"===e.trimSpace&&n!==y)for(var t=l();t===d(n,!0)&&kn(n,0,o.length-1,!e.rewind);)n<y?--n:++n;return n}(n))!==n&&(t=n,n=u,i=!1),n<0||r<n?n=f||!kn(0,n,t,!0)&&!kn(r,t,n,!0)?h?i?n<0?-(c%a||a):c:n:e.rewind?n<0?r:0:-1:S(L(n)):i&&n!==t&&(n=S(L(t)+(n<t?-1:1)))):n=-1,n}function k(n){return h?(n+c)%c||0:n}function E(){return bn(c-(O()||h&&f?1:a),0)}function S(n){return En(O()?n:a*n,0,E())}function L(n){return O()?n:wn((n>=E()?c-1:n)/a)}function A(n){n!==y&&(b=y,y=n)}function O(){return!rn(e.focus)||e.isNavigation}function M(){return o.state.is([G,$])&&!!e.waitForTransition}return{mount:function(){w(),n([B,q],w)},go:function(n,t,i){var r;M()||-1<(r=k(n=function(n){var t=y;{var i,r;P(n)?(r=n.match(/([+\-<>])(\d+)?/)||[],i=r[1],r=r[2],"+"===i||"-"===i?t=x(y+ +(""+i+(+r||1)),y):">"===i?t=r?S(+r):g(!0):"<"===i&&(t=m(!0))):t=h?n:En(n,0,E())}return t}(n)))&&(t||r!==y)&&(A(r),s.move(n,r,b,i))},scroll:function(n,t,i,r){u.Scroll.scroll(n,t,i,function(){A(k(s.toIndex(l()))),r&&r()})},getNext:g,getPrev:m,getAdjacent:_,getEnd:E,setIndex:A,getIndex:function(n){return n?b:y},toIndex:S,toPage:L,toDest:function(n){return n=s.toIndex(n),p?En(n,0,E()):n},hasFocus:O,isBusy:M}},Arrows:function(u,n,t){var i,r,o=K(u),e=o.on,c=o.bind,f=o.emit,a=t.classes,s=t.i18n,l=n.Elements,d=n.Controller,v=l.arrows,h=l.track,p=v,g=l.prev,m=l.next,y={};function b(){var n=t.arrows;!n||g&&m||(p=v||C("div",a.arrows),g=k(!0),m=k(!1),i=!0,L(p,[g,m]),v||un(p,h)),g&&m&&(an(y,{prev:g,next:m}),ln(p,n?"":"none"),z(p,r=dt+"--"+t.direction),n&&(e([Dn,q,J],E),c(m,"click",D(x,">")),c(g,"click",D(x,"<")),E(),R([g,m],Kn,h.id),f("arrows:mounted",g,m))),e(B,w)}function w(){_(),b()}function _(){o.destroy(),W(p,r),i?(N(v?[g,m]:p),g=m=null):I([g,m],ot)}function x(n){d.go(n,!0)}function k(n){return hn('<button class="'+a.arrow+" "+(n?a.prev:a.next)+'" type="button"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40" focusable="false"><path d="'+(t.arrowPath||"m15.5 0.932-4.3 4.38 14.5 14.6-14.5 14.5 4.3 4.4 14.6-14.6 4.4-4.3-4.4-4.4-14.6-14.6z")+'" />')}function E(){var n=u.index,t=d.getPrev(),i=d.getNext(),r=-1<t&&n<t?s.last:s.prev,n=-1<i&&i<n?s.first:s.next;g.disabled=t<0,m.disabled=i<0,R(g,Q,r),R(m,Q,n),f("arrows:updated",g,m,t,i)}return{arrows:y,mount:b,destroy:_}},Autoplay:function(n,t,i){var r,u,o=K(n),e=o.on,c=o.bind,f=o.emit,a=Hn(i.interval,n.go.bind(n,">"),function(n){var t=l.bar;t&&O(t,"width",100*n+"%"),f("autoplay:playing",n)}),s=a.isPaused,l=t.Elements,d=(o=t.Elements).root,v=o.toggle,h=i.autoplay,p="pause"===h;function g(){s()&&t.Slides.isEnough()&&(a.start(!i.resetProgress),u=r=p=!1,b(),f(Wn))}function m(n){p=!!(n=void 0===n?!0:n),b(),s()||(a.pause(),f(Xn))}function y(){p||(r||u?m(!1):g())}function b(){v&&(A(v,Z,!p),R(v,Q,i.i18n[p?"play":"pause"]))}function w(n){n=t.Slides.getAt(n);a.set(n&&+T(n.slide,Rt)||i.interval)}return{mount:function(){h&&(i.pauseOnHover&&c(d,"mouseenter mouseleave",function(n){r="mouseenter"===n.type,y()}),i.pauseOnFocus&&c(d,"focusin focusout",function(n){u="focusin"===n.type,y()}),v&&c(v,"click",function(){p?g():m(!0)}),e([U,Gn,q],a.rewind),e(U,w),v&&R(v,Kn,l.track.id),p||g(),b())},destroy:a.cancel,play:g,pause:m,isPaused:s}},Cover:function(n,t,i){var r=K(n).on;function u(i){t.Slides.forEach(function(n){var t=cn(n.container||n.slide,"img");t&&t.src&&o(i,t,n)})}function o(n,t,i){i.style("background",n?'center/cover no-repeat url("'+t.src+'")':"",!0),ln(t,n?"none":"")}return{mount:function(){i.cover&&(r(Yn,D(o,!0)),r([H,B,q],D(u,!0)))},destroy:D(u,!1)}},Scroll:function(o,c,e){var f,a,n=K(o),t=n.on,s=n.emit,l=o.state.set,d=c.Move,v=d.getPosition,h=d.getLimit,p=d.exceededLimit,g=d.translate,m=1;function y(n,t,i,r,u){var o,e=v(),i=(_(),i&&(i=c.Layout.sliderSize(),o=Sn(n)*i*wn(Y(n)/i)||0,n=d.toPosition(c.Controller.toDest(n%i))+o),xn(e,n,1));m=1,t=i?0:t||bn(Y(n-e)/1.5,800),a=r,f=Hn(t,b,D(w,e,n,u),1),l($),s(Gn),f.start()}function b(){l(3),a&&a(),s(J)}function w(n,t,i,r){var u=v(),r=(n+(t-n)*(t=r,(n=e.easingFunc)?n(t):1-Math.pow(1-t,4))-u)*m;g(u+r),o.is(Dt)&&!i&&p()&&(m*=.6,Y(r)<10&&y(h(p(!0)),600,!1,a,!0))}function _(){f&&f.cancel()}function i(){f&&!f.isPaused()&&(_(),b())}return{mount:function(){t(U,_),t([B,q],i)},destroy:_,scroll:y,cancel:i}},Drag:function(e,u,c){var f,t,o,a,s,l,d,v,n=K(e),i=n.on,h=n.emit,p=n.bind,g=n.unbind,m=e.state,y=u.Move,b=u.Scroll,w=u.Controller,_=u.Elements.track,x=u.Media.reduce,r=(n=u.Direction).resolve,k=n.orient,E=y.getPosition,S=y.exceededLimit,L=!1;function T(){var n=c.drag;C(!n),a="free"===n}function j(n){var t,i,r;l=!1,d||(t=R(n),i=n.target,r=c.noDrag,on(i,"."+mt+", ."+vt)||r&&on(i,r)||!t&&n.button||(w.isBusy()?F(n,!0):(v=t?_:window,s=m.is([G,$]),o=null,p(v,Ot,A,Ct),p(v,Mt,O,Ct),y.cancel(),b.cancel(),M(n))))}function A(n){var t,i,r,u,o;m.is(6)||(m.set(6),h("drag")),n.cancelable&&(s?(y.translate(f+D(n)/(L&&e.is(Dt)?5:1)),o=200<P(n),t=L!==(L=S()),(o||t)&&M(n),l=!0,h("dragging"),F(n)):Y(D(o=n))>Y(D(o,!0))&&(t=n,i=c.dragMinThreshold,r=tn(i),u=r&&i.mouse||0,r=(r?i.touch:+i)||10,s=Y(D(t))>(R(t)?r:u),F(n)))}function O(n){var t,i,r;m.is(6)&&(m.set(3),h("dragged")),s&&(i=function(n){return E()+Sn(n)*X(Y(n)*(c.flickPower||600),a?1/0:u.Layout.listSize()*(c.flickMaxPages||1))}(t=function(n){if(e.is(Pt)||!L){var t=P(n);if(t&&t<200)return D(n)/t}return 0}(t=n)),r=c.rewind&&c.rewindByDrag,x(!1),a?w.scroll(i,0,c.snap):e.is(zt)?w.go(k(Sn(t))<0?r?"<":"-":r?">":"+"):e.is(Dt)&&L&&r?w.go(S(!0)?">":"<"):w.go(w.toDest(i),!0),x(!0),F(n)),g(v,Ot,A),g(v,Mt,O),s=!1}function N(n){!d&&l&&F(n,!0)}function M(n){o=t,t=n,f=E()}function D(n,t){return I(n,t)-I(z(n),t)}function P(n){return mn(n)-mn(z(n))}function z(n){return t===n&&o||t}function I(n,t){return(R(n)?n.changedTouches[0]:n)["page"+r(t?"Y":"X")]}function R(n){return"undefined"!=typeof TouchEvent&&n instanceof TouchEvent}function C(n){d=n}return{mount:function(){p(_,Ot,nn,Ct),p(_,Mt,nn,Ct),p(_,At,j,Ct),p(_,"click",N,{capture:!0}),p(_,"dragstart",F),i([H,B],T)},disable:C,isDragging:function(){return s}}},Keyboard:function(t,n,i){var r,u,o=K(t),e=o.on,c=o.bind,f=o.unbind,a=t.root,s=n.Direction.resolve;function l(){var n=i.keyboard;n&&(r="global"===n?window:a,c(r,Nt,h))}function d(){f(r,Nt)}function v(){var n=u;u=!0,p(function(){u=n})}function h(n){u||((n=jt(n))===s(Un)?t.go("<"):n===s(qn)&&t.go(">"))}return{mount:function(){l(),e(B,d),e(B,l),e(U,v)},destroy:d,disable:function(n){u=n}}},LazyLoad:function(i,n,u){var t=K(i),r=t.on,o=t.off,e=t.bind,c=t.emit,f="sequential"===u.lazyLoad,a=[Dn,J],s=[];function l(){M(s),n.Slides.forEach(function(r){gn(r.slide,Wt).forEach(function(n){var t=T(n,Gt),i=T(n,Ft);t===n.src&&i===n.srcset||(t=u.classes.spinner,t=cn(i=n.parentElement,"."+t)||C("span",t,i),s.push([n,r,t]),n.src||ln(n,"none"))})}),(f?p:(o(a),r(a,d),d))()}function d(){(s=s.filter(function(n){var t=u.perPage*((u.preloadPages||1)+1)-1;return!n[1].isWithin(i.index,t)||v(n)})).length||o(a)}function v(n){var t=n[0];z(n[1].slide,Et),e(t,"load error",D(h,n)),R(t,"src",T(t,Gt)),R(t,"srcset",T(t,Ft)),I(t,Gt),I(t,Ft)}function h(n,t){var i=n[0],r=n[1];W(r.slide,Et),"error"!==t.type&&(N(n[2]),ln(i,""),c(Yn,i,r),c(k)),f&&p()}function p(){s.length&&v(s.shift())}return{mount:function(){u.lazyLoad&&(l(),r(q,l))},destroy:D(M,s),check:d}},Pagination:function(l,n,d){var v,h,t=K(l),p=t.on,g=t.emit,m=t.bind,y=n.Slides,b=n.Elements,i=n.Controller,w=i.hasFocus,r=i.getIndex,e=i.go,c=n.Direction.resolve,_=b.pagination,x=[];function k(){v&&(N(_?u(v.children):v),W(v,h),M(x),v=null),t.destroy()}function E(n){e(">"+n,!0)}function S(n,t){var i=x.length,r=jt(t),u=L(),o=-1,u=(r===c(qn,!1,u)?o=++n%i:r===c(Un,!1,u)?o=(--n+i)%i:"Home"===r?o=0:"End"===r&&(o=i-1),x[o]);u&&(dn(u.button),e(">"+o),F(t,!0))}function L(){return d.paginationDirection||d.direction}function A(n){return x[i.toPage(n)]}function O(){var n,t=A(r(!0)),i=A(r());t&&(W(n=t.button,Z),I(n,Qn),R(n,Jn,-1)),i&&(z(n=i.button,Z),R(n,Qn,!0),R(n,Jn,"")),g("pagination:updated",{list:v,items:x},t,i)}return{items:x,mount:function n(){k(),p([B,q],n);var t=d.pagination&&y.isEnough();if(_&&ln(_,t?"":"none"),t){p([U,Gn,J],O);var t=l.length,i=d.classes,r=d.i18n,u=d.perPage,o=w()?t:_n(t/u);z(v=_||C("ul",i.pagination,b.track.parentElement),h=gt+"--"+L()),R(v,V,"tablist"),R(v,Q,r.select),R(v,nt,L()===Bn?"vertical":"");for(var e=0;e<o;e++){var c=C("li",null,v),f=C("button",{class:i.page,type:"button"},c),a=y.getIn(e).map(function(n){return n.slide.id}),s=!w()&&1<u?r.pageX:r.slideX;m(f,"click",D(E,e)),d.paginationKeyboard&&m(f,"keydown",D(S,e)),R(c,V,"presentation"),R(f,V,"tab"),R(f,Kn,a.join(" ")),R(f,Q,Ln(s,e+1)),R(f,Jn,-1),x.push({li:c,button:f,page:e})}O(),g("pagination:mounted",{list:v,items:x},A(l.index))}},destroy:k,getAt:A,update:O}},Sync:function(i,n,t){var r=t.isNavigation,u=t.slideFocus,o=[];function e(){var n,t;i.splides.forEach(function(n){n.isParent||(f(i,n.splide),f(n.splide,i))}),r&&(n=K(i),(t=n.on)(zn,s),t(jn,l),t([H,B],a),o.push(n),n.emit(Fn,i.splides))}function c(){o.forEach(function(n){n.destroy()}),M(o)}function f(n,r){n=K(n);n.on(U,function(n,t,i){r.go(r.is(Pt)?i:n)}),o.push(n)}function a(){R(n.Elements.list,nt,t.direction===Bn?"vertical":"")}function s(n){i.go(n.index)}function l(n,t){b(Xt,jt(t))&&(s(n),F(t))}return{setup:function(){i.options={slideFocus:rn(u)?r:u}},mount:e,destroy:c,remount:function(){c(),e()}}},Wheel:function(e,c,f){var n=K(e).bind,a=0;function t(n){var t,i,r,u,o;n.cancelable&&(t=(o=n.deltaY)<0,i=mn(n),r=f.wheelMinThreshold||0,u=f.wheelSleep||0,Y(o)>r&&u<i-a&&(e.go(t?"<":">"),a=i),o=t,f.releaseWheel&&!e.state.is(G)&&-1===c.Controller.getAdjacent(o)||F(n))}return{mount:function(){f.wheel&&n(c.Elements.track,"wheel",t,Ct)}}},Live:function(n,t,i){var r=K(n).on,u=t.Elements.track,o=i.live&&!i.isNavigation,e=C("span",wt),c=Hn(90,D(f,!1));function f(n){R(u,rt,n),n?(L(u,e),c.start()):N(e)}function a(n){o&&R(u,it,n?"off":"polite")}return{mount:function(){o&&(a(!t.Autoplay.isPaused()),R(u,ut,!0),e.textContent="…",r(Wn,D(a,!0)),r(Xn,D(a,!1)),r([Dn,J],D(f,!0)))},disable:a,destroy:function(){I(u,[it,ut,rt]),N(e)}}}}),Ht={type:"slide",role:"region",speed:400,perPage:1,cloneStatus:!0,arrows:!0,pagination:!0,paginationKeyboard:!0,interval:5e3,pauseOnHover:!0,pauseOnFocus:!0,resetProgress:!0,easing:"cubic-bezier(0.25, 1, 0.5, 1)",drag:!0,direction:"ltr",trimSpace:!0,focusableNodes:"a, button, textarea, input, select, iframe",live:!0,classes:{slide:at,clone:st,arrows:dt,arrow:vt,prev:ht,next:pt,pagination:gt,page:mt,spinner:_+"__spinner"},i18n:{prev:"Previous slide",next:"Next slide",first:"Go to first slide",last:"Go to last slide",slideX:"Go to slide %s",pageX:"Go to page %s",play:"Start autoplay",pause:"Pause autoplay",carousel:"carousel",slide:"slide",select:"Select a slide to show",slideLabel:"%s of %s"},reducedMotion:{speed:0,rewindSpeed:0,autoplay:"pause"}};function Ut(n,r,t){var i=K(n).on;return{mount:function(){i([H,q],function(){p(function(){r.Slides.style("transition","opacity "+t.speed+"ms "+t.easing)})})},start:function(n,t){var i=r.Elements.track;O(i,"height",x(j(i).height)),p(function(){t(),O(i,"height","")})},cancel:nn}}function qt(o,n,e){var c,t=K(o).bind,f=n.Move,a=n.Controller,s=n.Scroll,i=n.Elements.list,l=D(O,i,"transition");function r(){l(""),s.cancel()}return{mount:function(){t(i,"transitionend",function(n){n.target===i&&c&&(r(),c())})},start:function(n,t){var i=f.toPosition(n,!0),r=f.getPosition(),u=function(n){var t=e.rewindSpeed;if(o.is(Dt)&&t){var i=a.getIndex(!0),r=a.getEnd();if(0===i&&r<=n||r<=i&&0===n)return t}return e.speed}(n);1<=Y(i-r)&&1<=u?e.useScroll?s.scroll(i,u,!1,t):(l("transform "+u+"ms "+e.easing),f.translate(i,!0),c=t):(f.jump(n),t())},cancel:r}}t=function(){function i(n,t){this.event=K(),this.Components={},this.state=a(1),this.splides=[],this.n={},this.t={};n=P(n)?pn(document,n):n;yn(n,n+" is invalid."),t=d({label:T(this.root=n,Q)||"",labelledby:T(n,Zn)||""},Ht,i.defaults,t||{});try{d(t,JSON.parse(T(n,c)))}catch(n){yn(!1,"Invalid JSON")}this.n=Object.create(d({},t))}var n=i.prototype;return n.mount=function(n,t){var i=this,r=this.state,u=this.Components;return yn(r.is([1,7]),"Already mounted!"),r.set(1),this.i=u,this.r=t||this.r||(this.is(zt)?Ut:qt),this.t=n||this.t,w(an({},Yt,this.t,{Transition:this.r}),function(n,t){n=n(i,u,i.n);(u[t]=n).setup&&n.setup()}),w(u,function(n){n.mount&&n.mount()}),this.emit(H),z(this.root,"is-initialized"),r.set(3),this.emit("ready"),this},n.sync=function(n){return this.splides.push({splide:n}),n.splides.push({splide:this,isParent:!0}),this.state.is(3)&&(this.i.Sync.remount(),n.Components.Sync.remount()),this},n.go=function(n){return this.i.Controller.go(n),this},n.on=function(n,t){return this.event.on(n,t),this},n.off=function(n){return this.event.off(n),this},n.emit=function(n){var t;return(t=this.event).emit.apply(t,[n].concat(u(arguments,1))),this},n.add=function(n,t){return this.i.Slides.add(n,t),this},n.remove=function(n){return this.i.Slides.remove(n),this},n.is=function(n){return this.n.type===n},n.refresh=function(){return this.emit(q),this},n.destroy=function(t){void 0===t&&(t=!0);var n=this.event,i=this.state;return i.is(1)?K(this).on("ready",this.destroy.bind(this,t)):(w(this.i,function(n){n.destroy&&n.destroy(t)},!0),n.emit(f),n.destroy(),t&&M(this.splides),i.set(7)),this},Bt(i,[{key:"options",get:function(){return this.n},set:function(n){this.i.Media.set(n,!0)}},{key:"length",get:function(){return this.i.Slides.getLength(!0)}},{key:"index",get:function(){return this.i.Controller.getIndex()}}]),i}();return t.defaults={},t.STATES=i,t},"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(n="undefined"!=typeof globalThis?globalThis:n||self).Splide=t();
//# sourceMappingURL=splide.min.js.map
