var $posts = {
    scroller: function () {
        function Scroller() {
            this.callbacks = []
            return this
        }
        Scroller.prototype.bindScrollEvent = function () {
            var _that = this

            window.addEventListener('scroll', function (event) {
                var wait = false
                var beforeOffsetY = window.pageYOffset

                if (wait) return
                wait = true

                setTimeout(function () {
                    var params = {
                        event: event,
                        beforeOffsetY: beforeOffsetY,
                    }
                    _that.callbacks.forEach(function (func) { func(params) })

                    wait = false
                }, 150)
            })
        }

        return Scroller
    },
    showTopic: function (evt) {
        var topicEl = document.body.clientWidth <= 768 ? document.getElementById('postTopicMobile') : document.getElementById('postTopic')
        var postTitle = document.getElementById('postTitle')
        var headerLogo = document.getElementById('mobile-header-logo');
        var menuEl = document.getElementById('header-menu');
        var headerEl = document.getElementById('header');
        var mobileHeaderEl = document.getElementById('mobile-header');
        var postTopicMobileEl = document.getElementById('postTopicMobile');

        var postTitleCoordinate = postTitle.getBoundingClientRect()
        var threshold = postTitle.offsetTop + postTitleCoordinate.height;

        // show title
        if (window.pageYOffset > threshold) {
            var beforeOffsetY = evt && evt.beforeOffsetY
            var isScrollToTop = beforeOffsetY - window.pageYOffset > 0

            topicEl.classList.remove('is-hidden-topic-bar')
            topicEl.classList.remove('hidden')

            menuEl.classList.add('hidden-menu')
            headerLogo.classList.add('hidden-menu');
            mobileHeaderEl.classList.add('header-shadow');
            headerEl.classList.add('header-shadow');
            topicEl.classList.add('immediately-show');

            if (beforeOffsetY - window.pageYOffset === 0) {
                topicEl.classList.remove('is-switch-post-title')
                topicEl.classList.remove('is-show-post-title')
                // topicEl.classList.remove('immediately-show')

                if (topicEl.classList.contains('is-show-scrollToTop-tips')) {
                    topicEl.classList.remove('is-show-scrollToTop-tips')
                    topicEl.classList.add('is-flash-scrollToTop-tips')
                }
                else {
                    // topicEl.classList.add('immediately-show')
                    postTopicMobileEl.classList.remove('hidden');
                }
            }
            // scroll to up👆
            else if (isScrollToTop) {
                // show scroll to top tips
                if (window.pageYOffset > window.innerHeight * 2) {
                    topicEl.classList.remove('immediately-show')
                    topicEl.classList.remove('is-show-post-title')
                    topicEl.classList.remove('is-switch-post-title')
                    topicEl.classList.remove('is-flash-scrollToTop-tips')

                    topicEl.classList.add('is-show-scrollToTop-tips')
                    topicEl.classList.add('immediately-show')

                    postTopicMobileEl.classList.remove('hidden');
                }
                // show post title
                // else {
                //     topicEl.classList.remove('immediately-show')
                //     topicEl.classList.remove('is-show-post-title')
                //     topicEl.classList.remove('is-show-scrollToTop-tips')
                //     topicEl.classList.remove('is-flash-scrollToTop-tips')
                //
                //     topicEl.classList.add('is-switch-post-title')
                // }
            }
            // scroll to down👇
            // else if (beforeOffsetY - window.pageYOffset !== 0) {
            //     topicEl.classList.remove('immediately-show')
            //     topicEl.classList.remove('is-switch-post-title')
            //     topicEl.classList.remove('is-show-scrollToTop-tips')
            //     topicEl.classList.remove('is-flash-scrollToTop-tips')
            //     topicEl.classList.add('is-show-post-title')
            // }
        }
        else {
            // hidden all
            topicEl.classList.remove('is-flash-scrollToTop-tips')
            topicEl.classList.remove('is-show-scrollToTop-tips')
            topicEl.classList.remove('is-switch-post-title')
            topicEl.classList.remove('is-show-post-title')
            topicEl.classList.remove('immediately-show')

            topicEl.classList.add('is-hidden-topic-bar')
            topicEl.classList.add('hidden')

            menuEl.classList.remove('hidden-menu');
            headerLogo.classList.remove('hidden-menu');
            mobileHeaderEl.classList.remove('header-shadow');
            headerEl.classList.remove('header-shadow');

            postTopicMobileEl.classList.add('hidden')
        }
    },
    catalogueHighlight: function () {
        var directory = document.querySelectorAll('.toc a')
        if (directory.length === 0) {
            return false
        }

        var tocContainer = document.querySelector('.toc')
        return function () {
            var contentTocList = []
            var activeClassName = 'is-active'

            directory.forEach(function (link) {
                if (!link.href) return
                var id = decodeURI(link.href).split('#')[1]
                contentTocList.push(document.getElementById(id))
            })
            var spacing = 10
            var activeTopicEl = null
            var scrollTop = window.pageYOffset
            for (var i = 0; i < contentTocList.length; i++) {
                var currentTopic = contentTocList[i]

                if (currentTopic.offsetTop > scrollTop + spacing / 2) {
                    // jump to next loop
                    continue
                }

                if (!activeTopicEl) {
                    activeTopicEl = currentTopic
                } else if (currentTopic.offsetTop + spacing >= activeTopicEl.offsetTop - spacing) {
                    activeTopicEl = currentTopic
                }

                var beforeActiveEl = document.querySelector('.toc' + ' .' + activeClassName)
                beforeActiveEl && beforeActiveEl.classList.remove(activeClassName)

                var selectTarget = '.toc a[href="#' + encodeURI(activeTopicEl.id) + '"]'
                var direc = document.querySelector(selectTarget)
                direc.classList.add(activeClassName)

                var tocContainerHeight = tocContainer.getBoundingClientRect().height
                if (direc.offsetTop >= tocContainerHeight - spacing) {
                    tocContainer.scrollTo({
                        // top: direc.offsetTop - spacing,
                        top: direc.offsetTop + 100 - tocContainerHeight,
                    })
                }
                else {
                    tocContainer.scrollTo({ top: 0 })
                }
            }
        }
    },
    smoothScrollToTop: function() {
        var Y_TopValve = (window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop);
        if (Y_TopValve > 1) {
            window.requestAnimationFrame($posts.smoothScrollToTop);
            scrollTo(0, Math.floor(Y_TopValve * 0.85));
        } else {
            scrollTo(0, 0);
        }
    },
    mounted: function () {
        // hljs && hljs.initHighlighting()

        var Scroller = this.scroller()
        var scrollerInstance = new Scroller()

        var catalogueHighlight = this.catalogueHighlight()
        catalogueHighlight && scrollerInstance.callbacks.push(catalogueHighlight)

        scrollerInstance.callbacks.push(this.showTopic)

        scrollerInstance.bindScrollEvent()

        $claudia.fadeInImage(document.querySelectorAll('.post-content img'))

        // document.getElementById('postTopic').addEventListener('click', this.smoothScrollToTop)
        document.getElementById('postTopicMobile').addEventListener('click', this.smoothScrollToTop)
    }
}

$posts.mounted()
