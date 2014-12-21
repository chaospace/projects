
/**
    홈페이지 angularjs적용 하기
*/
var app = angular.module('cpProjectApp', ['ngRoute', 'ngAnimate']);

var REQUEST_PROJECT_LIST_INITIALIZE ="REQUEST_PROJECT_LIST_INITIALIZE";
var PROJECT_PATH_CHANGE             ="PROJECT_PATH_CHANGE";
var PROJECT_STATE_CHANGE            ="PROJECT_STATE_CHANGE";
var APP_LOADING_CHANGE              ="APP_LOADING_CHANGE";

var PROJECT_PATH    ="/project_chaospace_angularjs/";
var ASSET_PATH      =PROJECT_PATH+"assets/data/";
var PARTISAL_PATH   =ASSET_PATH+"partisal/";
var DETAIL_PATH	  =ASSET_PATH+"project/";
		
var WIDE_W      = 1130;
var DESKTOP_W   = 840;
var TABLET_W    = 550;
var MOBILE_W    = 320;


var CONTAINER_W;
var LIST_UNIT;
	
var RENDERER_H  = 340;
var RENDERER_W  = 260;
var RENDERER_GAP = 30;

var PROJECT_STATE = {
	NONE:"NONE",
	UPDATE:"UPDATE",
	HIDE:"HIDE",
	SHOW:"SHOW",
	CHANGE:"CHANGE",
	DETAIL:"DETAIL",
	NORMAL:"NORMAL"
};

app.constant( "config", {
    prefix:"."
});


app.config(['$routeProvider', function( $routeProvider ){
	
	console.log("route");
	$routeProvider
	.when('/index', {
		templateUrl:'assets/data/project/blank.html',
		controller:'ProjectDetailController'
	}).
	when('/detail/:project',{
		templateUrl:'assets/data/project/project.html',
		controller:'ProjectDetailController'
	}).
	otherwise({
		redirectTo:'/index'
	});

}]);

/*
app.animation( '.project-renderer', function(){
	
	
	function getElementCurrentTransform(el) {
		var results = $(el).css('-webkit-transform').match(/matrix(?:(3d)\(\d+(?:, \d+)*(?:, (\d+))(?:, (\d+))(?:, (\d+)), \d+\)|\(\d+(?:, \d+)*(?:, (\d+))(?:, (\d+))\))/)

		if(!results) return [0, 0, 0];
		if(results[1] == '3d') return results.slice(2,5);

		results.push(0);
		return results.slice(5, 8);
	}
	
	
	var moveIn = function( element, className, done ){
	
	
		var values	= getElementCurrentTransform( element );
		console.log($(element).index() );
		
		var posx = values[0];
		var posy = values[1];
		var posz = values[2];
		console.log( values );
		//$(element).css('transform','translate3d('+-400+'px,'+ posy +'px, 0px)');
		
		return function( cancle ){
			if( cancle ){
				//element.stop();
			}
		}
	}
	
	var moveOut = function( element,  className, done ){
	
		var values	= getElementCurrentTransform( element );
		console.log("moveOut-values", values );	
		for( var i=0; i<values.length; i++){
			console.log( parseInt(values[i]) );
		}
		
		return function( cancle ){
			if( cancle ){
				//element.stop();
			}
		}
		
	}
	
	return {
		addClass:moveIn,
		removeClass:moveOut
	}

	
});
*/

/**
    네비게이션 정보 프로바이더
 */
app.factory("appModel",function ( config, $http, $rootScope ){


    function checkSupport3d() {
        if (!window.getComputedStyle) {
            return false;
        }

        var el = document.createElement('p'),
            has3d,
            transforms = {
                'webkitTransform':'-webkit-transform',
                'OTransform':'-o-transform',
                'msTransform':'-ms-transform',
                'MozTransform':'-moz-transform',
                'transform':'transform'
            };

        // Add it to the body to get the computed style.
        document.body.insertBefore(el, null);

        for (var t in transforms) {
            if (el.style[t] !== undefined) {
                el.style[t] = "translate3d(1px,1px,1px)";
                has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
            }
        }

        document.body.removeChild(el);
        return (has3d !== undefined && has3d.length > 0 && has3d !== "none");

    };


    var AppModel = function(){

        this.support3d      = checkSupport3d();
        this.projectPath    = "";
        this.naviDataPath   = "navi_category.json";
        this.isLoading      = false;
        this.projectState   = PROJECT_STATE.NONE;

				
		this.getTransform = function( tx, ty ){
			var transform ="";
			if(this.support3d){
				transform = "translate3d(" + tx + "px,"+ ty +"px, 0px)";
			} else {
				transform ="translate("+ tx + "px, "+ ty + "px)";
			}
			return transform;
		}
				

        /* path값에 따른 데이터 로드 처리 */
        this.loadData = function( path ){
            return $http.get( ASSET_PATH +path );
        };


        /* isLoading속성 업데이트 처리 */
        this.updateLoadState = function( newState ){
            if(this.isLoading != newState ){
                this.isLoading = newState;
                this.broadcastLoadState( newState );
            }
        };

        this.onUpdateLoadState = function( $scope, callback ){
            $scope.$on( APP_LOADING_CHANGE , function(event, data ){
               callback( data );
            });
        };

        this.broadcastLoadState =function( newState ){
            $rootScope.$broadcast( APP_LOADING_CHANGE, newState );
        };


        /* projectPath속성 업데이트 처리 */
        this.updateProjectPathState = function( newState ) {
            if(this.projectPath != newState ){
				this.projectPath = newState;
                //this.broadcasProjectPathState( newState );
				this.broadcasProjectState( PROJECT_STATE.CHANGE );
            }
        };

        this.onUpdateProjectPathState = function( $scope, callback ){
            $scope.$on( PROJECT_PATH_CHANGE, function(event, data ){
                callback( data );
            });
        };

        this.broadcasProjectPathState =function( newState ){
			$rootScope.$broadcast( PROJECT_PATH_CHANGE, newState );
        };


        /* projectState 속성 업데이트 처리 */
        this.updateProjectState = function( newState ) {
            if(this.projectState != newState ){
                this.projectState = newState;
                this.broadcasProjectState( newState );
            }
        };

        this.onUpdateProjectState = function( $scope, callback ){
            $scope.$on( PROJECT_STATE_CHANGE, function(event, data ){
                callback( data );
            });
        };

        this.broadcasProjectState =function( newState ){
            $rootScope.$broadcast( PROJECT_STATE_CHANGE, newState );
        };

    };

	var model = new AppModel();
    return model;

 });
 


app.controller( "NavigationController",function( $scope, appModel  ){

    $scope.onClick_MenuItem =function( $event, data ){
        $event.preventDefault();
        appModel.updateProjectPathState( data );
    };
	
	appModel.updateLoadState( true );	
	appModel.loadData(appModel.naviDataPath).success( function(data){
		$scope.naviList = data.navigation;
		appModel.updateLoadState( false );
		appModel.updateProjectPathState( $scope.naviList[0].data );
	}).error(function( error, code ){
		alert( error );
	});
	

});


app.controller( "ProjectDetailController", function( $scope, $routeParams ){
	//$scope.closeDetail
	$scope.renderComplete = false;
	console.log("$routeParams", $routeParams);
	$scope.$on("$routeChangeSuccess", function (scope, next, current) {
        console.log("succeess-chnage");
		//$scope.renderComplete = true;
    });
});

// proejct-list-controller;
app.controller( "ProjectListController",function( $element, $scope, $q, $timeout, appModel  ){

	$scope.renderComplete	= false;
	$scope.updateDisplay =function(){
		updateRendererLayout();
	}
	
	$scope.getPosition =function( index ){
		console.log("내 위치는", index );
	}
			
			
	
	/**
	▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨
	 promise init
	▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨
	*/
	var DELAY_TIME	=0;
	function getDeffered(){
		return $q.defer();
	}
	
	function promiseSuccess( deferred, results ){
		console.log("promiseSuccess", results );
        deferred.resolve( results );
	}
	
	function promiseReject( deferred, results ){
		deferred.reject( results );
	}
	
	function updatePromiseDelayTime( appendValue ){
		DELAY_TIME+=isNaN(appendValue) ? 0 : appendValue;
	}
	function initializeDeferred(){
		DELAY_TIME	=0;
	}


    function appendPromise( message, delay ){
        setTimeout( function(){
            promiseSuccess(message);
        }, delay );
        return deferred.promise;
    }
	
	
	function updateRendererLayout(){
			
		//promise를 위한 deffer참조
		var defaultX = (CONTAINER_W == MOBILE_W ) ? 30 : 0;
		var px       =defaultX;
		var py       =0;
		var info;
		var delays = getDelays();
		
		angular.forEach( _childCtrl, function( ctrl , index ){

			info = ctrl.getRendererSize( CONTAINER_W );
			if(!$scope.renderComplete){
				ctrl.updatePosition( -CONTAINER_W/1.2, py );
				ctrl.showStartTransition( px, py, delays[index] );
			} else {
				ctrl.updatePosition( px, py );
			}
			
			px+=(info.w+RENDERER_GAP);
			if( px >= CONTAINER_W ) {
				px = defaultX;
				py += (info.h+RENDERER_GAP);
			}
			
		});

		if( px != defaultX ) {
			py+=(info.h+RENDERER_GAP);
		}
		$element.css("height", py+"px");
	
	}

	function getDelays(){
		var delays=[];
		var delay = 100;
		for( var i=0; i<_childCtrl.length; i++ ){
			delays.push( delay+(i*delay) );
		}
		delays = delays.reverse();
		return delays;
	}
	
	// 리스트 사라지게 하기
	function clearProjectRenderer(){
		var deferred	=getDeffered();
		var delays = getDelays();
		updatePromiseDelayTime( delays[0]+(50*delays.length) );
		angular.forEach( _childCtrl, function( ctrl, index ){
			ctrl.showHideTransition(delays[index]);
		});

		setTimeout(function(){
			promiseSuccess( deferred, "clearProjectRenderer-complete");
		},  DELAY_TIME );

		return deferred.promise;


	}

    function initializeProjectList(){
		
		var deferred	=getDeffered();
		updatePromiseDelayTime( 10 );
		console.log("initializeProjectList-DELAY_TIME", DELAY_TIME );
		setTimeout( function(){
			$scope.renderComplete = false;
			$scope.projects =null;
			_childCtrl      =[];
			promiseSuccess( deferred, "initializeProjectList-complete");
		}, DELAY_TIME );
        
        return deferred.promise;
    }
	
	
	var ctrl = this;
	var _childCtrl  =[];
	ctrl.registerChildController = function( childCtrl ){
		console.log("자식 컨트롤러 등록", childCtrl );
		_childCtrl.push(childCtrl);	
	}
	
	/**
		단순 contents로드가 아닌 router를 이용해야 할듯.
	*/
	ctrl.requestDetail	=function(){
		console.log( "detail" );
	}
	
		
    $scope.$on( REQUEST_PROJECT_LIST_INITIALIZE, function(){
		
		console.log("REQUEST_PROJECT_LIST_INITIALIZE");
		$scope.initializeWindowSize();
		updateRendererLayout();
		
		$scope.renderComplete = true;
		appModel.updateLoadState( false );
		$scope.$apply();
		
    });

    // projectPath상태 변경 감시
    appModel.onUpdateProjectPathState( $scope, function( newState ){

        if( $scope.projects ) {
			clearProjectRenderer()
             .then( function(){
				initializeProjectList()
			})
			.then( function(){
				loadProjectList();
			} );
		} else {
			loadProjectList();
		}
    });

    // projectState상태 변경 감시
    appModel.onUpdateProjectState( $scope, function( newState ){

		switch( newState ){
			case PROJECT_STATE.CHANGE:
				console.log("프로젝트 변경");
				initializeDeferred();
				clearProjectRenderer()
                    .then( initializeProjectList() )
                    .then( loadProjectList() )
				  .then( appModel.updateProjectState(PROJECT_STATE.NORMAL));
			break;
			
			case PROJECT_STATE.NORMAL:
				console.log("노멀상태");
			break;
			
			case PROJECT_STATE.SHOW:
				break;

			case PROJECT_STATE.DETAIL:
				console.log("DETAIL-상태");
				break;
		
			case PROJECT_STATE.UPDATE:
				console.log("resize-update");
				break;
		}

    });

	
    function loadProjectList(){
		var deferred = getDeffered();
        updatePromiseDelayTime(10);
        setTimeout( function(){
            appModel.updateLoadState( true );
            appModel.loadData( appModel.projectPath )
                .success( function(data ){
                    $scope.projects = data.project;
                    promiseSuccess( deferred, "loadProjectList-complete");
                })
                .error( function( error, code ){
                    appModel.updateLoadState( false );
                    promiseReject(error);
                });
        }, DELAY_TIME );


		return deferred.promise;
		
    };
	

});



app.directive( "imageloaded", function(){
	return {
		restrict:"A",
		link: function( scope, iElement, iAttrs ){
			iElement.bind('load', function(){
				console.log("load", iAttrs.imageloaded );
				scope.$apply( iAttrs.imageloaded );
			});
		}
	}
});

		
		
app.directive( "projectList", function(){

	return{
		replace:true,
		restrict:'EA',
		template:'<div id="project-container"></div>',
		transclude:true,
		link:function( scope, iElement, iAttr ){
		 // 
		},
		controller:"ProjectListController"
	}


});

app.directive( "resizeable", function($window){
	
	return function( $scope ){

		function checkUpdateDisplayMode(){
			var w = $scope.windowWidth;
			var listArea	=-1;
			if( w > WIDE_W ){
				listArea= WIDE_W;
			} else if( w > DESKTOP_W && w < WIDE_W ){
				listArea= DESKTOP_W;
			} else if( w > TABLET_W && w < DESKTOP_W ) {
				listArea= TABLET_W;
			} else {
				listArea= MOBILE_W;
			}
			if( listArea != CONTAINER_W ){
				CONTAINER_W =listArea;
				LIST_UNIT=parseInt(CONTAINER_W/RENDERER_W);
				return true;
			}
			return false;
		}
	
		$scope.initializeWindowSize = function(){
			
			$scope.windowWidth = $window.innerWidth;
			$scope.windowHeight = $window.innerHeight;
			if( checkUpdateDisplayMode()){
				$scope.updateDisplay();
			}
			
		}

		$scope.initializeWindowSize();

		angular.element($window).bind( "resize", function(){
			$scope.initializeWindowSize();
			$scope.$apply();
		});

	};

});

app.directive( "projectRenderer", function( $compile, $http, $templateCache, $timeout ){

	return {
		restrict:"E",
		replace:true,
		require:['^projectList', 'projectRenderer'],
		/*scope:{
			project:'=',
			position:'&'
		},*/
		template:'<div ng-include="getTemplateUrl()"></div>',
		
		/*
		templateUrl:function( iElement, iAttrs ){
			console.log("templateurl" );
			return PARTISAL_PATH + "default_project_renderer.html";
		},*/
		
		link:function( scope, iElement, iAttr, controllers ){

			var projectListCtrl = controllers[0];
			var rendererCtrl    = controllers[1];
			projectListCtrl.registerChildController( rendererCtrl );
			
			
			
			
			
			/**
			▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨
				클릭 핸들러
			▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨
			*/
			scope.onClick_Renderer =function( strName ){
				console.log( "click", strName );
				projectListCtrl.requestDetail();
			};
			
			if(scope.$last){

				$timeout( function() {
					$timeout( function() {
						scope.$emit(REQUEST_PROJECT_LIST_INITIALIZE);
					});
				});

			}

            /**
             ▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨
             destory
             ▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨
             */
            scope.$on('$destroy', function(){
                console.log("destory");
                iElement.remove();
            });
			
			
		},
		
		controller:function( $scope, $element, $sce, appModel , $animate){
			
			$scope.transform	= appModel.getTransform( 0, 0 );
			$scope.class		= '';

			$scope.trustDangerousSnippet = function( info ){
				return $sce.trustAsHtml(info);
			};

			$scope.getResponseImageSrc = function(){
				var path = $scope.project.image.prefix;
				if( window.innerWidth > WIDE_W ){
					path += $scope.project.image.bigsrc;
				} else {
					path += $scope.project.image.src;
				}
				return path;
			}
			
			$scope.getTemplateUrl	=function(){
				return PARTISAL_PATH + $scope.project.template;
			}
			
			/**
			▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨
				현재 window영역에 따른 renderersize 반환 메서드 
			▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨
			*/
			this.getRendererSize = function( screenWidth ){
				var info = {w:RENDERER_W, h:RENDERER_H};
				if($scope.project.type == "main" ){
					info	= ( screenWidth == WIDE_W ) ? {w:(RENDERER_W*2)+RENDERER_GAP, h:RENDERER_H} : info;
				}
				return info;
			}
			
			/**
			▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨
				리사이즈 처리 및 등장/퇴장 트렌지션 처리
			▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨
			*/
			var posx, posy;
			this.updatePosition =function( px, py ) {
				posx = px;
				posy = py;
				$scope.transform =  appModel.getTransform( px, py );
				$scope.$apply();
			}
			
			this.showStartTransition =function( px, py, delay ){
				var scope =this;
				//console.log("$animate", $animate );
				/*$animate.addClass( $element, 'on', {
					from:{
						'-webkit-transform': 'translate3d(' + -500 + 'px,0,0)',
						'-moz-transform': 'translate3d(' + -500 + 'px,0,0)',
						'-ms-transform': 'translate3d(' + -500 + 'px,0,0)',
						'-o-transform': 'translate3d(' + -500 + 'px,0,0)',
						'transform': 'translate3d(' + -500 + 'px,0,0)'
					},
					to:{
						
						'-webkit-transform': 'translate3d(' + px + 'px,0,0)',
						'-moz-transform': 'translate3d(' + px + 'px,0,0)',
						'-ms-transform': 'translate3d(' + px + 'px,0,0)',
						'-o-transform': 'translate3d(' + px + 'px,0,0)',
						'transform': 'translate3d(' + px + 'px,0,0)'
						
					}
					
				} );*/
				/*
				$timeout( function(){
					$scope.class='renderer-transition';
					scope.updatePosition( px, py );
				}, delay );
				*/
				
				
			}
			
			this.showHideTransition =function( delay ){
				var scope =this;
				$timeout( function(){
					scope.updatePosition( CONTAINER_W+500, posy );
				}, delay );
			}

		}

	}

});


// loading-progress-controller
app.controller( "ProgressViewController", function( $scope, appModel ){
    $scope.loading = appModel.isLoading;
    appModel.onUpdateLoadState( $scope, function( newState ){
        $scope.loading = newState;
    });
});