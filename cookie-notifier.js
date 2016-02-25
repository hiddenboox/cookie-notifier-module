angular.module('cookieNotiferModule', [])

	.provider('cookieNotifier', function () {
		const styleDOM = document.createElement('style');

		this.cookieNotifierMessage = '';
		function defaultPosition() {
			styleDOM.innerHTML = `
        .cookie-notifier > section {
          position: absolute;
          bottom: 0;
        }

        .is-cookie-notifier-visible {

        }

        .cookie-notifier > section > p {
          padding: 15px;
        }
      `;

			document.head.appendChild(styleDOM);
		};

		this.cookieNotifierDefaultAppearance = {
			left: '0',
			margin: '0 15px',
			width: 'calc(100vw - 30px)',
			background: 'red'
		};

		this.cookieNotifierCloseDefaultAppearance = {
			top: '-15px',
			right: '-10px',
			'font-size': '30px',
			position: 'absolute'
		};

		defaultPosition();

		this.configElement = opt => {
			if (!opt || !opt.message) return this;

			this.cookieNotifierMessage = opt.message;

			if (!opt.style) return this;

			Object.assign(this.cookieNotifierDefaultAppearance, opt.style);

			return this;
		};

		this.configClose = opt => {
			if (!opt) return this;

			Object.assign(this.cookieNotifierCloseDefaultAppearance, opt);

			return this;
		};

		this.$get = function () {
			return {
				elementMessage: this.cookieNotifierMessage,
				elementStyle: this.cookieNotifierDefaultAppearance,
				closeStyle: this.cookieNotifierCloseDefaultAppearance
			};
		};
	})

	.component('cookieNotifier', {
		controller: ['$window', '$scope', '$element', 'cookieNotifier', function ($window, $scope, $element, cookieNotifier) {
			this.title = cookieNotifier.elementMessage;

			const
				rootElementDOM = $element[0],
				elementDOM = rootElementDOM.querySelector('section'),
				closeDOM = rootElementDOM.querySelector('div');

			configureNotifierRootElement(rootElementDOM);
			configureNotifierCloseElement(closeDOM);
			configureNotifierElement(elementDOM);

			this.closeNotifier = () => {
				elementDOM.classList.add('bounce');

				$scope.$apply($window.localStorage.setItem('is-cookie-notifier-accepted', true));
			};

			$scope.$watch(() => {
				return $window.localStorage.getItem('is-cookie-notifier-accepted');
			}, (val) => {
				console.log(val);
				if (!val) document.body.appendChild(document.createElement('cookie-notifier'));
			});

			function configureNotifierRootElement(element) {
				element.classList.add('cookie-notifier');
			}

			function configureNotifierCloseElement(element) {
				if (cookieNotifier.closeStyle) {
					Object.assign(element.style, cookieNotifier.closeStyle);
				}
			}

			function configureNotifierElement(element) {
				element.classList.add('animated');

				if (cookieNotifier.elementStyle) {
					Object.assign(element.style, cookieNotifier.elementStyle);
				}

				const evts = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend'.split(' ');

				evts.forEach(evt => element.addEventListener(evt, () => {
					element.classList.remove('bounce');
					document.body.removeChild(rootElementDOM);
				}));
			}
		}],
		template: `
    <section>
      <p>{{ ::$ctrl.title }}</p>
      <cookie-notifier-close on-close="$ctrl.closeNotifier()"></cookie-notifier-close>
    </section>
  `
	})

	.component('cookieNotifierClose', {
		controller: ['$scope', '$element', function ($scope, $element) {
			const
				rootElementDOM = $element[0],
				elementDOM = rootElementDOM.querySelector('div');

			configureNotifierCloseElement(elementDOM);

			function configureNotifierCloseElement(element) {
				element.addEventListener('click', $evt => {
					console.log($scope);
					$scope.$ctrl.onClose();
				});
			}
		}],
		template: `
		<div>T</div>
	`,
		bindings: {
			onClose: '&'
		}
	})

	.config(function (cookieNotifierProvider) {
		cookieNotifierProvider
			.configElement({
				message: 'hellos'
			})
			.configClose({
				color: 'blue',
				background: 'black',
				'border-radius': '50% 50%',
				width: '35px',
				height: '35px',
				'text-align': 'center'
			});
	})

	.run(['$window', ($window) => {
		const
			cookieNotifier = document.querySelector('cookie-notifier'),
			body = document.body;

		if (!$window.localStorage.getItem('is-cookie-notifier-accepted')) {
			if (!cookieNotifier) {
				body.appendChild(document.createElement('cookie-notifier'));
			}
		} else {
			body.removeChild(cookieNotifier);
		}
	}]);