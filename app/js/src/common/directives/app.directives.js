'use strict';

angular
    .module('notester')
    .directive('noteNaming', function($timeout) {
        return {
            restrict: 'EA',
            scope: {
                note: '=noteNaming',
                isNewNote: '=',
                saveCallback: '&'
            },
            link : function (scope, element, attrs) {
                var input = angular.element(element[0].querySelector('input[name="note_title[]"]'));

                element.on('dblclick', function(){
                    $timeout(function() {
                        input[0].focus();
                        input[0].select();
                    });

                    scope.note.editing = 1;
                    scope.isNewNote    = false;

                    scope.$apply();
                });

                input.on('blur', function(){
                    scope.note.editing = 0;
                    scope.note.title   = (scope.note.title.trim()) ? scope.note.title : "New Note";

                    scope.saveCallback();
                    scope.$apply();
                });

                input.on("keydown keypress", function (event) {
                    if(event.which === 13) {
                        scope.$apply(function () {
                            scope.note.title = (scope.note.title.trim()) ? scope.note.title : "New Note";

                            scope.saveCallback();
                            scope.note.editing = 0;
                        });

                        event.preventDefault();
                    }
                });

                if (scope.isNewNote)
                {
                    $timeout(function(){
                        element.triggerHandler('dblclick');
                    });
                }
            }
        };
    })
    .directive('contenteditable', function ($timeout) {
        return {
            restrict: 'A', // only activate on element attribute
            require: '?ngModel', // get a hold of NgModelController
            scope: {
                currentPage: '=',
                onFocusCallback: '&'
            },
            getLines: function(lines, upto) {
                var finalLine = [];

                for (var i = 0; i < lines.length; i++) {

                    if (lines[i])
                    {
                        finalLine.push(lines[i]);
                    }

                    if (finalLine.length >= upto) break;
                }

                return finalLine.join(" ");
            },
            getTitle: function(elemHtml) {
                var divElem        = angular.element(document.createElement("div"));
                var strippedString = elemHtml.replace(/(<([^>]+)>)/ig,"|<<<<<<|");
                var title          = this.getLines(strippedString.split('|<<<<<<|'), 1);
                    title          = divElem.html(title).text().trim();

                title = (title.length < 15) ? title : title.substring(0, 15) + '...';

                if (!title.length) title = 'New Page';

                return title;
            },
            link: function (scope, element, attrs, ngModel) {
                if (!ngModel) return; // do nothing if no ng-model

                var that = this;

                // Specify how UI should be updated
                ngModel.$render = function () {
                    if (ngModel.$viewValue)
                    {
                        $timeout(function() {
                            var elemHtml = element.html().trim();
                            scope.currentPage.title = that.getTitle(elemHtml);
                            scope.$apply();
                        });
                    }

                    element.html(ngModel.$viewValue || '');
                };

                ngModel.$render();

                // Listen for change events to enable binding
                element.on('blur keyup change', function () {
                    scope.$apply(readViewText);
                });

                element.on('focus', function () {
                    scope.$apply(function () {
                        scope.onFocusCallback();
                    });
                });

                // element.on('keypress', function(ev){
                //     if(ev.keyCode == '13')
                //         document.execCommand('formatBlock', false, 'p');
                // });


                // element.on("paste", function(e) {
                //     console.log('here');
                //     // cancel paste
                //     e.preventDefault();

                //     // get text representation of clipboard
                //     var text = e.clipboardData.getData("text/plain");

                //     // insert text manually
                //     document.execCommand("insertHTML", false, text);
                // });

                // Write data to the model
                function readViewText() {
                    var html = element.html();
                      // When we clear the content editable the browser leaves a <br> behind
                      // If strip-br attribute is provided then we strip this out
                    if (attrs.stripBr && html == '<br>') {
                        html = '';
                    }

                    $timeout(function() {
                        scope.currentPage.title = that.getTitle(html);
                        scope.$apply();
                    });

                    ngModel.$setViewValue(html);
                }
            }
        };
    });