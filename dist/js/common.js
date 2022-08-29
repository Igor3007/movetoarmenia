document.addEventListener("DOMContentLoaded", function (event) {


    /* ==============================================
         mobile menu
         ============================================== */

    const elContainer = document.querySelector('[data-menu="container"]')
    const elButton = document.querySelector('[data-menu="btn"]')

    function mobileMenu(params) {
        this.el = params.elContainer;
        this.button = params.elButton;
        this.state = 'close';

        this.open = function () {

            if (window.userMenuInstance) {
                window.userMenuInstance.close()
            }

            this.el.classList.add('open')
            this.button.classList.add('open')
            document.body.classList.add('hidden')
            this.state = 'open';

        }

        this.close = function () {

            this.el.classList.add('close-animate')
            this.button.classList.remove('open')

            setTimeout(() => {
                this.el.classList.remove('open')
                this.el.classList.remove('close-animate')
                document.body.classList.remove('hidden')
                this.state = 'close'
            }, 200)


        }

        this.toggle = function () {
            if (this.state == 'close') this.open()
            else this.close()
        }
    }

    window.menuInstanse = new mobileMenu({
        elButton,
        elContainer
    })

    elButton.addEventListener('click', function () {
        window.menuInstanse.toggle()
    })

    /* ========================================
    mobile nav
    ========================================*/

    document.querySelectorAll('.header-nav li').forEach(li => {
        li.addEventListener('click', e => {
            //e.preventDefault()
            li.classList.toggle('active')
        })
    })

    /* ==============================================
    select
    ============================================== */

    // public methods
    // select.afSelect.open()
    // select.afSelect.close()
    // select.afSelect.update()

    const selectCustom = new customSelect({
        selector: 'select'
    })

    selectCustom.init()

    /* ==============================================
    login menu
    ============================================== */

    if (document.querySelectorAll('.login-icon').length) {
        document.querySelectorAll('.login-icon').forEach(item => {
            item.addEventListener('click', e => {
                if (e.target.closest('.header-top__login')) {
                    e.target.closest('.header-top__login').classList.toggle('open')
                    e.stopPropagation()
                }

            })
        })

        document.addEventListener('click', e => {
            if (document.querySelector('.header-top__login')) {
                document.querySelector('.header-top__login').classList.remove('open')
            }
        })
    }

    /* ==============================================
    login menu
    ============================================== */
    if (document.querySelector('.filter-counter')) {

        function totalSumm() {
            let summ = Number(0)

            document.querySelectorAll('.filter-counter__number input').forEach(item => {
                summ += Number(item.value)
            })

            document.querySelector('.filter-counter__total').innerText = summ
        }

        document.querySelector('.filter-counter').addEventListener('click', e => {
            e.stopPropagation()

            if (!e.target.closest('.filter-counter__item')) {
                e.target.closest('.filter-counter').classList.toggle('active')
            }

        })

        let incButton = document.querySelectorAll('.filter-counter__number-inc')
        let decButton = document.querySelectorAll('.filter-counter__number-dec')

        incButton.forEach(item => {
            item.addEventListener('click', e => {
                let parentElement = e.target.closest('.filter-counter__number')
                let inputElement = parentElement.querySelector('input')

                if (inputElement.value >= 0) {
                    inputElement.value = Number(inputElement.value) + 1
                }

                totalSumm()
            })
        })

        decButton.forEach(item => {
            item.addEventListener('click', e => {
                let parentElement = e.target.closest('.filter-counter__number')
                let inputElement = parentElement.querySelector('input')

                if (inputElement.value > 0) {
                    inputElement.value = Number(inputElement.value) - 1
                }

                totalSumm()
            })
        })

        //out click

        document.addEventListener('click', e => {
            if (document.querySelector('.filter-counter')) {
                document.querySelector('.filter-counter').classList.remove('active')
            }
        })



    }












});