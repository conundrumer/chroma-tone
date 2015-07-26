/*eslint no-multi-spaces: 0 comma-spacing: 0*/
'use strict';

function doNothing() {}

module.exports = function(editor) {
var setCursor = (hotkey) => () => editor.setCursor(hotkey);
var keys = [		'icon',			'hotkey',	'selectGroup',	'onTouchTap'		];
var buttons = {
select: [		'cursor-default',	'1',		'cursor',	setCursor('1')		],
pencil: [		'pencil',		'2',		'cursor',	setCursor('2')		],
brush: [		'brush',		'3',		'cursor',	setCursor('3')		],
line: [			'line',			'4',		'cursor',	setCursor('4')		],
curve: [		'curve',		'5',		'cursor',	setCursor('5')		],
multiLine: [		'multi-line',		'6',		'cursor',	setCursor('6')		],
eraser: [		'eraser',		'7',		'cursor',	setCursor('7')		],
save: [			'content-save',		null,		'self',		doNothing		],
undo: [			'undo-variant',		'mod+z',	null,		editor.toggleDebug	],
redo: [			'redo-variant',		'mod+shift+z',	null,		doNothing		],
pan: [			'cursor-move',		null,		'cursor',	doNothing		],
zoom: [			'magnify',		null,		'cursor',	doNothing		],
viewfinder: [		'viewfinder',		null,		'self',		doNothing		],
layers: [		'layers',		null,		'self',		doNothing		],
play: [			'play',			null,		'playback',	doNothing		],
pause: [		'pause',		null,		'playback',	doNothing		],
stop: [			'stop',			null,		'playback',	doNothing		],
rewind: [		'rewind',		null,		null,		doNothing		],
fastFoward: [		'fast-forward',		null,		null,		doNothing		],
stepBack: [		'skip-previous',	null,		null,		doNothing		],
stepForward: [		'skip-next',		null,		null,		doNothing		],
flag: [			'flag-variant',		null,		'self',		doNothing		],
multiFlag: [		'flag-outline-variant',	null,		'self',		doNothing		],
onionSkin: [		'onion-skin',		null,		'self',		doNothing		],
camera: [		'video',		null,		'self',		doNothing		],
music: [		'music-note',		null,		'self',		doNothing		],
record: [		'movie',		null,		'self',		doNothing		],
showToolbars: [		'chevron-down',		null,		null,		editor.showToolbars	],
hideToolbars: [		'chevron-up',		null,		null,		editor.hideToolbars	],
toggleTimeControl: [	'chevron-down',         null,		null,		editor.toggleTimeControl],
chat: [			'message',		null,		'self',		doNothing		],
settings: [		'settings',		null,		'self',		doNothing		],
help: [			'help-circle',		'h',		'help',		editor.toggleHelp	]
};

for (let buttonName in buttons) {
	let button = buttons[buttonName];
	let props = {};
	keys.forEach((key, i) => {
		props[key] = button[i];
	});
	let label = buttonName.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
	if (props.hotkey) {
		label += ` (${props.hotkey})`;
	}
	props.tooltip = label;
	buttons[buttonName] = props;
}

return buttons;

};
