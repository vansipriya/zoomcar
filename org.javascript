/*  plugin - dtree
    version - 1.0.0
*/
(function ($) {
    $.fn.dtree = function (options) {
        var $this = this,
            settings = $.extend({
                isHorizontal: false,
                customTemplate: false,
                gutter: 20,
                zoom: true,
                placeholderImg: "https://x1.xingassets.com/assets/frontend_minified/img/users/nobody_m.original.jpg",
                isCollapsible: true,
                searchbox: true
            }, options),
            _parents = [],
            _nodeDims = {},
            _iniScale = 0,
            _domNodes = {},
            _dtreeID = $this.attr("id") || "dtree" + Math.round(Math.random() * 100),
            init = {
                logger: function () {
                    _parents = calc.getParentChildObj();
                    _nodeDims = init.getNodeDimensions();

                    $this.html(init.buildNodes(_nodeDims));
                    init.rearrangeDom();
                    init.setSelectors();
                    console.log(settings.nodes, _nodeDims, _parents);
                },
                buildNodes: function (nodeDims) {
                    if (settings.customTemplate) {

                    } else {
                        var activepid = _parents.rootNode.id,
                            pNodes = _parents.listParents.length,
                            ndPipe = [activepid],
                            nodeHTML = "<div class=\"dtree-wrapper " + (settings.isHorizontal ? 'dtree-x' : '') + "\">";

                        if (settings.searchbox) {
                            nodeHTML += "<div class=\"dtree-searchbox\"><input type=\"text\" class=\"dtree-search-control\"><i class=\"dtree-search-icon\"></i>" +
                                "<ul class=\"dtree-search-list\"></ul>" +
                                "</div>";
                        }


                        nodeHTML += "<div class=\"dtree-node-wrapper\" id=\"" + _dtreeID + "_node_0\" style=\"width:100%\">" +
                            "<div class=\"dtree-node-cell\">" +
                            "<div class=\"dtree-node-main\">" +
                            "<div class=\"dtree-node \" style=\"margin:" + settings.gutter + "px\">" +
                            "<div class=\"dtree-img\"><img src=\"" + (_parents.rootNode.img || settings.placeholderImg) + "\"></div>" +
                            "<div class=\"dtree-name\">" + _parents.rootNode.name + "<span class=\"sub\">" + _parents.rootNode.txt + "</span></div>" +
                            (settings.isCollapsible ? "<div class=\"node-collapse\" data-dtree-collpase-node=\"#" + _dtreeID + "_node_" + activepid + "\"  style=\"bottom : " + settings.gutter / 2 + "px\"></div>" : "");
                        nodeHTML += (settings.isHorizontal) ? "<i class=\"dtree-branch liney\" style=\"height:50%; top:50%; left: " + settings.gutter + "px; width: calc(100% - " + settings.gutter + "px)\"></i>" : "<i class=\"dtree-branch liney\" style=\"width:50%; left:50%; top: " + settings.gutter + "px; height: calc(100% - " + settings.gutter + "px)\"></i>";
                        nodeHTML += "</div></div><div class=\"dtree-child-container\" id=\"" + _dtreeID + "_node_" + activepid + "\"></div></div></div>";

                        while (pNodes && ndPipe.length) {
                            activepid = ndPipe.shift();
                            var childNdsObj = _parents.parentObj[_parents.listParents.indexOf(activepid)];
                            if (!childNdsObj) {
                                continue;
                            }
                            var childNds = childNdsObj.childNodes;

                            nodeHTML += "<div class=\"dtree-node-wrapper \" id=\"" + _dtreeID + "_parent_" + activepid + "\"  >";

                            for (var i = 0; i < childNds.length; i++) {
                                var isParent = (_parents.listParents.indexOf(childNds[i].id) !== -1),
                                    hasSiblings = childNds.length - 1,
                                    xRight = (i == 0) ? "0" : "50%",
                                    xWidth = "50%",
                                    isMiddle = (i > 0 && i < childNds.length - 1),
                                    imgSrc = childNds[i].img || settings.placeholderImg,
                                    parObj = _parents.parentObj[_parents.listParents.indexOf(childNds[i].id)],
                                    isCollapsedNode = childNds[i].isCollapsed;

                                if (isMiddle) {
                                    xWidth = "100%";
                                    xRight = "0";
                                }
                                settings.nodes[_parents.nodeById[childNds[i].id]].lvl = 1 + settings.nodes[_parents.nodeById[activepid]].lvl;
                                // width: 100/childNds.length
                                nodeHTML += "<div class=\"dtree-node-cell \"  >" +
                                    "<div class=\"dtree-node-main\">" +
                                    "<div class=\"dtree-node "+(isCollapsedNode && "dtree-collapsed")+"\" style=\"margin:" + settings.gutter + "px\">" +
                                    "<div class=\"dtree-img\"><img src=\"" + imgSrc + "\"></div>" +
                                    "<div class=\"dtree-name\">" + childNds[i].name + "<span class=\"sub\">" + childNds[i].txt + "</span></div>";
                                nodeHTML += isParent ? (settings.isCollapsible ? "<div class=\"node-collapse\" data-dtree-collpase-node=\"#" + _dtreeID + "_node_" + childNds[i].id + "\" style=\"bottom : " + settings.gutter / 2 + "px\"></div>" : "") : "";

                                if (settings.isHorizontal) {
                                    nodeHTML += (!isParent && parObj ? (parObj.childNodes.length > 1) : parObj) ? "<i class=\"dtree-branch liney\" ></i>" : "<i class=\"dtree-branch liney\" style=\"width:calc(100% - " + settings.gutter + "px); left: 0\"></i>";

                                } else {
                                    nodeHTML += (!isParent && parObj ? (parObj.childNodes.length > 1) : parObj) ? "<i class=\"dtree-branch liney\"></i>" : "<i class=\"dtree-branch liney\" style=\"height:calc(100% - " + settings.gutter + "px); top: 0\"></i>";
                                    nodeHTML += hasSiblings ? "<i class=\"dtree-branch linex\" style=\"right: " + xRight + "; width: " + xWidth + "\"></i>" : "";
                                }

                                nodeHTML += "</div></div>" +
                                    ((hasSiblings && (settings.isHorizontal)) ? "<i class=\"dtree-branch linex\" style=\"bottom: " + xRight + "; height: " + xWidth + "\"></i>" : "") +
                                    "<div class=\"dtree-child-container  "+(isCollapsedNode && "dtree-target-collapsed")+"\" id=\"" + _dtreeID + "_node_" + childNds[i].id + "\"></div></div>";
                                ndPipe.push(childNds[i].id);
                            }
                            nodeHTML += "</div>";
                            pNodes--;
                        }


                        return nodeHTML + "</div>";
                    }
                },
                rearrangeDom: function () {
                    var $parents = $this.find(".dtree-node-wrapper").not("#" + _dtreeID + "_node_0"),
                        $childs = $this.find(".dtree-child-container");

                    $parents.each(function () {
                        var custNodeId = $(this).attr("id").split("_"),
                            cutNode = $(this).detach(),
                            pasteNode = $childs.filter("#" + _dtreeID + "_node_" + custNodeId[custNodeId.length - 1]);
                        if (pasteNode) {
                            cutNode.appendTo(pasteNode);
                        }
                    });
                },
                getNodeDimensions: function () {
                    $('body').append("<div id=\"tempNode\"><div class=\"dtree-node\"><div class=\"dtree-img\"><img src=\"https://x1.xingassets.com/assets/frontend_minified/img/users/nobody_m.original.jpg\"></div> <div class=\"dtree-name\">mmmmmmmmmm</div><span class=\"dtree-branch\"><i></i><i></i></span></div></div>");
                    var $tempNode = $("#tempNode");
                    var tw = $tempNode.children().eq(0).outerWidth(true),
                        th = $tempNode.children().eq(0).outerHeight(true);

                    $tempNode.remove();
                    return {
                        nodeWidth: tw,
                        nodeHeight: th
                    };
                },
                setSelectors: function () {
                    _domNodes.nodes = $this.find(".dtree-node");
                    _domNodes.nodeContainers = $this.find(".dtree-node-main");
                    _domNodes.nodeCollapseToggles = $this.find(".node-collapse");
                    _domNodes.searchControl = $this.find(".dtree-search-control");
                    _domNodes.searchResults = $this.find(".dtree-search-list");

                    _domNodes.nodeCollapseToggles.on("click", handlers.onToggleCollapseClick);
                    _domNodes.searchControl.on("keyup", handlers.onSearchKeyup);
                    _domNodes.searchControl.on("blur", handlers.onSearchBlur);
                    $this.on("mousedown", handlers.onBoardMouseDown);
                    $this.on("mouseup", handlers.onBoardMouseUp);
                },
                buildSearchResults: function (listObj, skey) {
                    var listHTML = "";
                    for (var i = 0; i < listObj.length; i++) {
                        // var si = listObj[i].name.indexOf(skey) !== -1 ? listObj[i].name.indexOf(skey) : listObj[i].txt.indexOf(skey),
                        //     name = listObj[i]

                        listHTML += "<li>" + listObj[i].name + "</li>";
                    }

                    _domNodes.searchResults.html(listHTML);
                }
            },
            handlers = {
                onToggleCollapseClick: function (e) {
                    var $thisBtn = $(this),
                        $target = $($thisBtn.attr("data-dtree-collpase-node"));
                    $thisBtn.parent().toggleClass("dtree-collapsed");
                    $target.toggleClass("dtree-target-collapsed");
                },
                onSearchKeyup: function () {
                    var searchKey = $(this).val(),
                        resultSet = [];

                    resultSet = settings.nodes.filter(function (i, n) {
                        return (i.name.indexOf(searchKey) !== -1 || i.txt.indexOf(searchKey) !== -1);
                    });

                    init.buildSearchResults(resultSet, searchKey);
                },
                onSearchBlur: function () {
                    _domNodes.searchResults.html("");
                },
                onBoardMouseDown: function (e) {
                    _iniScale = e.offsetX;
                    $this.on("mousemove", handlers.onBoardMouseMove);
                },
                onBoardMouseUp: function (e) {
                    $this.off("mousemove", handlers.onBoardMouseMove);
                },
                onBoardMouseMove: function (e) {
                    e.preventDefault();
                    var pleft = _iniScale - e.offsetX;
                    $this.children().eq(0).scrollLeft($this.children().eq(0).scrollLeft() + pleft);
                },
                onScroll: function () {

                },
                onWheel: function (event) {
                    return;
                    event.preventDefault();
                    _iniScale = 0;
                    console.log(event.originalEvent);
                    if (!event.originalEvent.wheelDelta) {
                        if (event.deltaY < 0) {
                            _iniScale += 0.08;
                        } else {
                            _iniScale -= 0.05;
                        }
                    } else {
                        if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
                            _iniScale + 0.08;
                        } else {
                            _iniScale -= 0.05;
                        }
                    }

                    $this.children().eq(0).css("transform", "scale(" + _iniScale + ")");
                }
            },
            calc = {
                getParentChildObj: function () {
                    var nodes = settings.nodes,
                        keyNodeId = {},
                        parents = nodes.map(function (i, n) {
                            var childNd = nodes.filter(function (k) {
                                return k.pid == i.id
                            });
                            keyNodeId[i.id] = n;
                            return {
                                pid: i.id,
                                pname: i.name,
                                childNodes: childNd
                            }
                        }).filter(function (i) {
                            return i.childNodes.length
                        });

                    return {
                        parentObj: parents,
                        listParents: parents.map(function (i) {
                            return i.pid
                        }),
                        rootNode: nodes.filter(function (i) {
                            return i.pid == 0
                        })[0],
                        nodeById: keyNodeId
                    };
                }
            };

        init.logger();
        return $this;
    }
}(jQuery));
/* usage */
$(document).ready(function(){


var treeNodes = [{
        id: 22,
        pid: 71,
        name: "JOHN",
        txt: "COO",
        isCollapsed: true,
        img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyqv0F5ZNE-pV9ZtwU9DUehsqYwN2EF7oFeA&usqp=CAU"
    },
    {
        id: 13,
        pid: 22,
        name: "K.SNAT",
        txt: "CTO",
        img: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAoHCBUWFRgWFhUYGBgZGBgYGBwcHBgaGh4eHxgZGhoYGBwcIS4lHB4rIRgYJjgmKy8xNTU1GiQ7QDs0Py40NTEBDAwMEA8QHxISHjQrJCs0NDQ2NDQ0NDE0NDQ0NDQ0NDQxNDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDE0NP/AABEIAQYAwAMBIgACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAAAwQCBQYBB//EAD0QAAECAgYIBQIFAwQDAQAAAAEAAhEhAwQSMUFRBSIyYXGBocEGQpGx8GLhE1Ky0fEUI3IVksLSBxaiM//EABkBAQEBAQEBAAAAAAAAAAAAAAABAgMEBf/EACIRAQEAAgMBAQEAAgMAAAAAAAABAhEDEiExQVFhoRMiMv/aAAwDAQACEQMRAD8A+vbW6CRjq5dkM9mWeCXyG1ifeaBHy9eqAw1c+6bvNn90EpG/DHhNA2d8UAszvigltTyxQCG1MeqBCGtn3SHm6dEhidnL2kkMfLl9kAiOtl/KHW3QUdYpmsaXFzWNbtFxDQOMZZLgNOf+RgCW1OjtwMDSPi1plItaCHEcYIsxt+PoZNqV0EjHV68F8FrvjLSJMTWnN3Naxo4Cy2Y4q3o3x9pIHbbSziQ5jI4Siyyf5U210r7fGGr14oDZlfFcFoH/AMl0FIbFZZ/TvuDiS5hM7zCLOct67uipGkAxDozaRrAg3EHJVmyz6yGrvigFmef8oJbU8sUAhN0xhiiEPN06JCOtl2SGPly+yQxGzl7yQCLU7oJtboIRHZkPRDPZlnggEx1cuyR8vXqhnIX44cZpu82f3QIw1c+6bO+KXSO1gfaaCW1PLFAP08/hThtY90hZ2Z9fZIQmL8vdA/V87IN+1h2SGPmy+y9AjM3hB4Pq5fAn+V2HwJftS6e6Axk6XRA47OHZYUtIGguJgxoJJwAAiT7rOMdU3ZrnvHdYLKlSWbjZbHcXAmfTmlWTd04/TFdptIU9ijtNoG4Rl/m/N27DDEmek8GkiDXA77lb8GUIbVmmE3kuccb4DouooVw7W17ZhJi4v/0WcS8XjCKmHg5jXhzXwGIAkfsu0cQq1LimS41xmnPC1HStJGq8XGEuB3Kr4B0o+rU4q1If7b3WAHEwa+JgW4QcZb4grq6YLgPE7rNPaEjIgiRjnHjBMctXRy4Szb7WPq5d7kG+7DsoqpTClYx8ZOY1zTdEOaDH2UonIyAuXd4Hv6V5w2ce6bvLn90jDVF2aB/jdj8KH6efwoTCTZ9Uu2Z9fZAO7ax7p+r52XpEJi8ryGPmy+yBx2sOyD6uXwJCOsbxh7JC1tS6e6BCzO+KQhrZ4cUAs3ziglM3HugQ83TokLWtdDtNIebDLohnMXBAha3Q5pG1K6CHWulBCbUhKCBGOrljwXOePqMuqNK0eWw6O4PaT0XRxjq4/stb4ia01Wma+H/5vmTARALmzO8BS/Gsfsct4Sj/AE7ei37KQNvIC4yqU7xVqMMe2jZB5e8mYg8gNGVy5jSVba939usU1LP8kG3wg0kxM1wke/8AH178VpmCqOk9KUdECXuAWi8I0r3tsvDwBIWpGIWu8W1GkfSBrGWhEAkxg3e6E4cE2sx1V4+LqpGFtxjebMgtL4oo2Pa2mYQ5plH2ioalVayyDG0dWYCRKAc45mAmcVuq/ostoKRsBGAfBt0WzdAYSCnm/Eyl6+uz8Hut1Kr7qMNzui3/AIrcxtSuh/C4zwQX0dmruiR+HbiSTBwdNo3Qc3muzJjIXhd8buPDyY3HL0j5evVIw1c8eKR8uOaRhq4/utMEbMr4pCzvjyQGzIzig1b5xQIWda+PeaQ83ToglM3FIebDLogQjrZYcEhandBDOYuHZCLV0oIAltcsUGZ2cOyCe1ywQZHZw7TQN/l+YcUO7Zx7pu8vzFLpC7HugGezzwQz2b8cEMtnnihls344oG4X495rX6borVEWnPW3tIIIPIrYbxfj3koqzRhzSDeRdwwhyWbNytYXWUrjtCVUNoqMQjC2WmGBe6c7jBbB2jW/mcAZwFmHsoC+wLIwc4Dhtf8AJUKzpLXDHOsiFp0L4RgPU91w8fRx3fjb0dG1rgG4H5NRVhll5dAzyXMaT009rgaF4Axa4REdxE81oq9pys0xAiWNABNkmJnmLk1bF3JX0KjrVELoBxnkfuoaWkaSPkRkuNfphwo2scB9OY4HArd1CmcaJr3bUJ8nQBTVMrNN54NqhY55BJkSImYtkOIid4PoutM9m/FavQFXs0doGJe5zjCcBEwHutoZbN+K74zUfP5cu2Wzd5vmKbjtYdppv83zBN52sO0lpzBLavwxQS2uWKCe1fhggntcsEAb9nDsm/y/MOKXyN2HZN3l+YoBzGzj3Qz2eeCHIbOPeaGWzzxQAbV8oIDHVwHZNrdBIx1cseCBHy4Z9UMpC4pHy9eqRhq590A6t04oRZmJxSNnfFIWZ3xQIQ1sf3SHmxySENbPDikPN06IOS8SMFG5rphr3EjIEQiOEIehXJVurfjutMeGmIY6IjiYHqV9G8R6O/qKu9ok4AuYcnNBI5GJB3FfHaCuOoqUxaWgmy4GMjEfsFzyx98erj5PPXSaO0A6jLhTuc++yaMMbKB2g8mcYYwkt7SaOq7Qf7b3bMA58BK8QBulliFBo3SjaZkIgOEj6RU7quTmd5PZYenUv7Wj/wDX6MvdSlgDgyDWgktEBvvJIvgtRpHSZtsYzECQE8YADiei3emq6GUZaHRc6WcPnZcz4fq5pKwHuua4AcjID5hvVxnm658mXvXF9q0fQGhoqNt5DGh3ECfUlWSITF5/leUbwACDEOER85r2FnWvj/K7PAQ82OSQjrY/skIa3TokI62WHBAAtTMoINa+UEhandBI2t0EATkbgkfLhn1SMdXLskfL16oBMNXA90Js3TikYauePFNnfFAJjsy6ITGQvz90P08/hThtY90COHmz+6Awkb8E/V87IN+1h2QBq7U+qAQ2p9UH1cvgT/K7D4ECENY3Zeyb/Ll9kG/Zw7J+lBFW3wa5wuDTLORK+aeJdFMpRbaJwk4d8wvpVM4RgLlz9PVA0uZCUy3hly9oLPJLJMo7cGWNtxr5RUa86gcWviISBNxn8mt6PFrSwTgQMNyv6b0G0xkuVfoRodcCsdsb9eiY5T/ygrWkX07yRHIX2QMf4XQaFo3NDGM2nGDeJvdwF54LW0VVs4SyC7zwjoZzR+O8Qc4ag/K3A87+EFcZ3uvxnO/8eNt+us0W8NYGGJsgAYq4BCZmDctLWBIw+Qmr7a2ZBwtdOa73D9jwzJb3+XL7JCOsLsvdRUdOCYGQyUp3bOPdZs00ER2ZdEOtsy6J/jdj8KH6efwqATGQvxSOHmz+6HdtY90/V87IAMJG/P2QGG1PqnHaw7IPq5fAgGWzPPFLpjaxHvJNnfFIQ1s+6Bv82X2QTmb8O0kh5unRYPpBfjkgzE9qWWC8tRk6UFA+kLlhBa6ptO6mwww7KJro9ViEF5HNakkSoK/XGULHUjzBjBE57gBiTcBvXN+H9Pf1bXh4DKQPc5gwLMGxxcBI535wj8UUb6zSMoGRsMMXnAuu/wDkS4kqbRvh4UMQL7x+4yK7dMen/b7XOZWZbn4t1hocJhaSsVVsZBb1z4ar2mB87R+tuPEKJ1VIM4EYOEwRmF4MuHLG/wBfS4+fGz+NPQaMbtOGqJnf9PP2Wv0jpOnFMKVrzbZgNgN/I5olZ3c4xXSVhheAxg3RULNCiFm8YnNe7gwx4579v14ufO8mW/z8bbRdfbTsZSNla2m4td5mnh+xV5o1vVavRmjTRWrNzoRG/Arb0bb1nLUvjEelespHAXleuXkFlUrKzCVyniBNs+q1z7wM/YX9vVG0hYYj03ZLNxWVsjKYvx7yTf5svssKKkBFoYyIyKzh5unRYaL5nawHtJBPallgkI62XZNrdBAAs3zigENbPugENqeWKCUzs4dpIEPN06KtTOtGPopaZ0oi43D7KuCtYxmsmBeoCjltHgvK9InyHdG38l7ioI2MEzDFZOYvWr0q7ETqNpvCruqjXG4w6bz7K090BFZUeyOA9lZalQMqzWiQwUjGCFyyK8Cm1eAIzHivWoMUGJuXjSvXXHmsBegxO0dwA9SSeyxesmXuObvYAdli8q0hUqey6dxlzwW0h5unRaKkOK3VC+IDvKQDDllxXPKNRmRHWy7IRaulBDOY2ce8kIjsyzwWVB9XL4EG/Zw7IDHal090Bjqm4Y8EFatumALsFg0LKt7QGQWDV0x+M165el0WxWUFGG3jA3KxKlaiwY+XFZRUHoReRQlBDSzkpqMyHAKuQXROHurLBIcAqVjmvCvf3KxeUGTURYuKgxpTBpWLLlHTOjAKGsvP4bg3acbDeLiGx5RjyW5ErKjfEAjGfrPujoX9flylFHAAYAQCwcEVWpXbuy2WinksANwJB9+61tMruhXRa5uEYn0+yzl8WNkd2zj3Q/Tz+FCYaouOPFCYbM+vsuTRG1uhzSMdXLHghNq6SF0oYi88L0FOlZrGJJhIYLJrViCpAuiCjpFIVDSXJEqNjp8z+491KHLXOrIAOdot6WvZwHJZ0NZjfIq5ZTtpZhl17a8bAFePMlG16yDwjL14g2AUrbhdcPbBVLZJKtUOy3gPZBHSOhFYMCU/deNdNUSuKhpHwWLqWJPGCqU9KM1m2T63jhcvIPrIETkPU3AeqlqhtWY3ttOPEyEORd0WmrNaayM53p4fr349K97TFjNSOBebwP8AEX73blicva6kd8uCY47tdKQoX8CpYrEro8qlS7gT6d1LomkFst1gXA3iF05TncVm9qhYbL2nePurfYsbyMNXPHikbO+PJAYapvOPFAbN81xaDPZ54LGlIsmF8J91kZbPPFY0wFknGE+6QVGqUKJhWRfxPCa6MMioaUo6l+l/+09lHSOjcD6EK6XbnK3Sn8Z9GDrFjXsGZa5wMeNpo5jJSVKvCkAIMPeIwORWt0jo+ndXG0rGugxlkiy6Dg5zogOhtCy0+itN0TS/iW2McIuDnCEL5vE98SOK58kl9l9j18OVxmsvl/03rKbNTUdOCYQ5qsaF5ELDvQrOiq1IL29R+61hlueuPLhjLuVm12I5K/RUosjgoXUBIlAFeVeqkQBd6Lp5XCsazSTlmjiALUZYq2au28iKOo2wIgBHd1Ut/iz/AC1RMYnOarPClfS3qtTvGK8OWVt9fSw1j5HM+JtF0j2udQvL3S1CQCc7JkORW/8ABNU/DqdC2yWkstOBECHR1gRgQZclC54+6uaHr2q8Gdl9/FrXd134b+OXPjub23ZK8isaOnY/GazLF2eJg5VqZWHqtTXKjd0LgWgnaIBHpJZiW1yxVeoQNG04wlyJgrAntcsFxrYRZunFY07dUnMe6yAs74rykZInMHqg1n4obCOJgMyb4DkCdwCnAJxgMhL1N6psALrRvAluH3IjyCnL5Lsx9TsAFwWVpVBSLIUqmhaikVX/ABV4aVTQsWoncPdCVXFKAsHU/qVdC0XrB74KFhjM3DqqtZc5zg1uPsrINm56wNIoC4CJc4CF5JACpU2maJt0XncJepV0jW6VpyyleM9YcHfe0FrqWuGF6r+ItLNL2OcLJLSA0Rc4iMpCZmSsqjomsUsCGBjc3mHMNESecF5cuK9q92HJj1m0FNWCYzMFb8MaQY80uu1rGFocYiRgRDp0Wzq/hFkP7lK9+YYAxvc9VfqXhqq0RtMoW2oxJcXPJN8dYldOPHrd1nm5scsesXW1Rt49VLMCF6jfVWGdgRzEj6hYNoi0arnEbzEj1kec967eV4/WTnO3KrWDK9SU1OQIkWhm2/8A248jHcqlNStc2LDaBxHscjuTS7b/AEY3+0w4gH3JVmFq+UFW0ez+2w5NH7qyRa3QXG/WwCG1PqgEJm7Ae0kH1cvgTjs4dlBpbUHOGTiBwEgvQ5Z6VZZdaGy73HzotaKeC7T2M6XnOUZeqjq0M1G+tBVF22vDTQWvNNvSjY95g3mSZBBddWB+bof2UzYNbbe+ywZuI91qqfSVDQSbGlpN2yFpaw6mrDrT3WRgI3fNyGm6r3i2iaYNY58LoS6EKCh8T2iXGrPbkbTY7gBiqVDQ0TLrLnclUrGlGsOq22/ytGy3e6GO72Wpj/C6bCkpnOi57YOM5mJhvwBVR9K97T+EA4xshx2YnL80onKSqVCq01Pr0xMCdVgEG8XAX7oxXUUwbRihYABEvd/tbD/mt/GWt0JoCw+28l1Ib3Z8jLkuro3wECByVJlNJDWlyvrTZClWJpQtU6tKN1bTqNo+nUZrC1f9QSvWvV0LVLTz4kA9ndv4VR9GA4kStbWROB4jNZhs47oH1BHdYsEXtbvS/CR1lXaQ1uQa0HkBFSER2ZdEhls490P08/hXnbAY7UuiCcjs4H2mgNrdBIx1cuyCGt1cPaWGQwdkc1ztPoOnjIscMwT1iJLqI+Xr1QmGrn3ktTKwch/oNY+n/cD7KCv6JpaJhpHubZbCNkkmZhdBdsTZ3xWp8TUf9h7Y7TT0mkyuxwjtIthEF0gTdOSr1nTcAGm3YOIhZ6GK17nEG75kovwXAlpFph9jcdxXVFo6coWybaJyDYepJWrrOmqV72tbZY0uaCdp0LQjMyEsgpv9EjNh5Yr1ugnRmCtaHtYbRMcXPpSX4hpLncJXcyFc0XpGrFsGmw78r4Bx4GMDyKrt0BxWTvDjSLorcYsdroZlC6BDw535biODTfyVyvVW29hEiwGHOEfZcdT+GX0Y/tPc0ZSc30cDDkoKj4hrFXfYpGl7RCMCYj/EOPSKZS/YzPXWUryw60jgY38M1C6uNxcOMfcLFnimrPbrOgDfbBHb2VSsaRqZ2awwblhuLTq0z8w6915/UNWpdW6M7L2uhkT1is4yDsDcYGaLptW0oUn4wGKi0doSlphaY5oAheSL45DcrtH4Vpnednq7/qs3KGlJ9cNwW28OUFp9o3NvO/D2WNB4WdGBpGjgCfeC6Ko1VtG38NvN2JOZWMsprxZFi6Q2cT7zQmGzPqkYaufdCbO+K5qRtXSghMdXEdkM9mWeCGchfj3mgR8uOfVAYaufdN3mz+6CUjfhjwmgRs3ziue01Sxc9n5WsB4utk9LK6ES2p5YrknuLnvJ80SPWPdaxm025k1OZkrdBUgZEcFfYwRgrBooQOS7pWu/0+Fyt0DMHNiFtRQghVaShcJYKbR6yqsNylFSGQULKMqw6lLRAaxwCu6LZoW2RHJcxpbR7BaN7nOMAPQLbUmkTiIZ8clXq1CXkvddOCvsZjiq3oZxw4DJQ0Ph9+K+i0dSBMSFHX6INY4gXNJHoptp84qdQc5xfgXEjhFdTopltjqM3tNpvdSGqBlGxgEyAp6rRWHAq1Y3nhi9zLpR9D910cbV0oLmak6y8PGS6aMdmXRefL6sCY6uXZI+XHPqhnIX44cZpu82f3WVAYauJ7pGzfOKCUjfh2mgltTyxQD9PP4UO7ax7oRZ2Z/NyEQ1hecOKB+r52Qb9rDskPNjl0XoEZm8IPB9XLD2Whr9UIJF0ZtK3wFq+UPmK1WmarWKQ0ZonMbYLrYeXNDgQIQg0zED6rWN1UsaVtFai257eqkoXRBa6TgtjS6Ke6BBa14xi6z6wmF5TaKeSCC0PGMXWd4jZu5Lp2iaRVR8oYiSsPYlHo2ka6MWTvgXf9Vb/o3C+B4RPZTtDTVUjSFD/QuOs50OAnwW+NVIGB9f2UVLU3kXt9TH2VmUNNcKKImwxgZm4DCXwzUjaMGDRcFcFRfZOsMb4x9llRVJwF4jvj+yXKf1JKqUrw0LU0tKXh35Yho3zmVs63oymeCGlg4lw/4rGj0O8ANFjVnMuETh5Tikyi6aZ+tTOyowGjjeffosiyJVyr6Ap2iBcyLiXPIc+ZM4A2LlQ0n4br1JBrX0LWxHnpOzMMo4K9p/TTbaLqbnEGBsi857guiMtnn8Kiq1F+GxjBc1rW4m4ASPJSws3Tj8wXHK7a0HdtY90/V87L0iExeV5DzY5dFAG/aw7IPq5fAgEdY3jDggFral83oGxvjySENbPDiiIH19Ol6DW1roYcJoiBt7oc0jbldDmiIEY6uWPBAfJ163IiBGzK+P8IdTfHkiIBFmd8Uu1+nHeiIF+v04b0AtTugiIA190OaA2pXQ/hEQCfJ163JGGrnjxRECNiV8eSbG+PJEQDq618cOM0+vp0vRECEdbLDgm3uhzREH/9k="
    },
    {
        id: 5,
        pid: 13,
        name: "J.STAR",
        txt: "Manager",
        img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQbB9PU-bMhyGNvTO3TjQT7EEkFdvWl4uy2Qm1XKvHO4xi5eTB"
    },
    {
        id: 7,
        pid: 79,
        name: "M.SHINE",
        txt: "Sample text",
        img: "data:image/jpeg;base64,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"
    },
    {
        id: 71,
        pid: 0,
        name: "JUSTIN",
        txt: "CEO",
        img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEbaGBW2UIzfDfoanVyRV30-WP1Oa8xwifZw&usqp=CAU"
    },
    {
        id: 79,
        pid: 71,
        name: "RAHUL",
        txt: "CFO",
        img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDkTsNGFbxDsH3DpodD3S1A44UgQL-VH3ZFA&usqp=CAU"
    },
    {
        id: 24,
        pid: 22,
        name: "jai",
        txt: "Assistance Techical Officer",
        img: "https://www.nzherald.co.nz/resizer/f6nbpG5XjgJAFYU3N0EtFv3pBnE=/360x384/filters:quality(70)/arc-anglerfish-syd-prod-nzme.s3.amazonaws.com/public/RBHF3AOWM5BTJJZPFIT6IEFJKM.jpg"
    },
    {
        id: 26,
        pid: 79,
        name: "DANY",
        txt: "Assistant Manager",
        img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTcQMKekkzJxFcW5qe4uW4BNtsE6WerW4E_w&usqp=CAU"
    },
    {
        id: 9,
        pid: 7,
        name: "K.Lee",
        txt: "Sample text",
        img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4Kj_0vdo0KZEgYF6tvyPicqnSzv2jYikU-w&usqp=CAU"
    },
    {
        id: 10,
        pid: 9,
        name: "JOHN DOE",
        txt: "Sample text",
        img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSap9EYM_xHqXJ4fW6Tfyn3g8c-ZMh550gM9A&usqp=CAU"
    },
    {
        id: 8,
        pid: 9,
        name: "A.SMITH",
        txt: "Sample text",
        img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPQq4nd9h9js4jJx8fKyGQ63SPQaMXfxb1aQ&usqp=CAU"
    },
    {
        id: 88,
        pid: 22,
        name: "jagdish",
        txt: "Marketing Manager",
        img: "https://static.indiatvnews.com/ins-web/images/rohit-getty-1519822385.jpg"
    },
    {
        id: 25,
        pid: 5,
        name: "ajay",
        txt: "Executive",
        img: ""
    },
    {
        id: 28,
        pid: 5,
        name: "vijay",
        txt: "Executive",
        img: ""
    },
    {
        id: 1,
        pid: 88,
        name: "alpha",
        txt: "robo1",
        img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUAW3DBuMFkkXW15RIGRWJt7ID2XnjygOIyK5Tdj9KXVp12NCR"
    },
    {
        id: 2,
        pid: 88,
        name: "beta",
        txt: "robo2",
        img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgc55Ng1-rAgGMT6GKcHO0aFUcXSWUHwOp88n2QFQ2T92FJk-t"
    },
    {
        id: 33,
        pid: 88,
        name: "gamma",
        txt: "robo3",
        img: ""
    },
    {
        id: 4,
        pid: 88,
        name: "delta",
        txt: "robo4",
        img: ""
    },
    {
        id: 125,
        pid: 4,
        name: "eric",
        txt: "Executive",
        img: ""
    },
    {
        id: 124,
        pid: 4,
        name: "t'challa",
        txt: "Executive",
        img: "https://static1.squarespace.com/static/56000fe2e4b05e6e3887d5c4/5602274ae4b0641e3a0e98e7/5a961d9424a694da8598769c/1519787606726/Screen+Shot+2018-02-27+at+10.12.55+PM.png?format=1000w"
    },
];
  $("#ochart").dtree({
    isHorizontal: false,
    nodes : treeNodes
  });
});


