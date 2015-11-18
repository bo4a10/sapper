var configHelper = {
    gameLevels: ['tiny', 'pro', 'expert', 'Bruce Li'],
    playgroundConf : {
        'tiny' : {
            'width' : 5,
            'height' : 5
        },
        'pro' : {
            'width' : 10,
            'height' : 10
        },
        'expert' : {
            'width' : 15,
            'height' : 10
        },
        'Bruce Li' : {
            'width' : 25,
            'height' : 15
        }
    },
    bombsPerDiff: {
        'tiny': 5,
        'pro' : 15,
        'expert': 30,
        'Bruce Li': 70
    }
};

var sapperObject = {
    width: 5,
    height: 5,
    bombs: 0,
    bombsCount: 0,
    flagsCount: 0,
    cellsOpened: 0,
    bombsArray: [],
    getGameLegend: function() {
        return "<div class='legend'>Left mouse click - open cell. <br> Right mouse click - set/unset flag</div>";
    },
    getRestartButton: function() {
        return "<button id='restart'>Restart game</button>";
    },
    renderCells: function () {
        for (var row = 1; row <= this.height; row++) {
            for (var col = 1; col <= this.width; col++){
                var div       = document.createElement('div');
                div.className = 'cell n_' + row + '_' + col;
                div.id        = row + '_' + col;

                document.getElementById('sapper').appendChild(div);
            }
        }

        while (this.bombsCount < this.bombs) {
            var forHeight = Math.round(Math.random() * (this.height - 1 + 1)) + 1;
            var forWidth  = Math.round(Math.random() * (this.width - 1 + 1)) + 1;

            var bElem = document.getElementById(forHeight + '_' + forWidth);

            if (bElem && this.bombsArray.indexOf(forHeight + '_' + forWidth) < 0) {
                this.bombsArray.push(forHeight + '_' + forWidth);
                this.bombsCount++;
            }
        }
    },
    setInfo: function () {
        var infoBlock       = document.getElementById('info');
        var infoContent     = '<b>There are: ' + this.bombsCount + ' bombs | ' + this.flagsCount + ' flag(s) was set</b>';
        var restartButton   = this.getRestartButton();
        infoBlock.innerHTML = infoContent + this.getGameLegend() + restartButton;
        this.restartBtnListener();
    },
    stopEvents: function() {
        document.getElementById('sapper').removeEventListener('click', this.openCellAction);
        document.getElementById('sapper').removeEventListener('contextmenu', this.setFlagAction);
    },
    openCell: function(cell) {
        if (cell === null || cell.className.indexOf('opened') > 0) return;

        if (sapperObject.cellIsBomb(cell, false)) return; // BOMB !!!!

        var cellPosition = cell.id.split('_');
        var cellRow      = cellPosition[0];
        var cellCol      = cellPosition[1];
        var bombsAround  = 0;

        bombsAround = this.openClickedCell(cellRow, cellCol, cell, bombsAround);

        // check if user opens all cell - he WINS !!!
        if (this.checkOnWin()) return true;

        this.openSiblingsCell(cellRow, cellCol, cell, bombsAround);
    },
    openClickedCell: function(cellRow, cellCol, cell, bombsAround) {
        // run around cell
        for (var x = cellRow-1; x < cellRow-1+3; x++) {
            for (var y = cellCol-1; y < cellCol-1+3; y++) {

                if (+x < 1 || +y < 1 || (+x == cellRow && +y == cellCol)) continue;

                var newId   = x + '_' + y;
                var newCell = document.getElementById(newId);

                if (sapperObject.cellIsBomb(newCell, true)) {
                    cell.innerText = +cell.innerText + 1;
                    bombsAround++;
                }
            }
        }

        // open current cell
        cell.style.backgroundColor = 'lightblue';
        cell.className = cell.className + ' opened';
        this.cellsOpened++;

        return bombsAround;
    },
    openSiblingsCell: function(cellRow, cellCol, cell, bombsAround) {
        if (bombsAround == 0) {
            // run around cell
            for (var x = cellRow-1; x < cellRow-1+3; x++) {
                for (var y = cellCol-1; y < cellCol-1+3; y++) {
                    var newId   = x + '_' + y;
                    var newCell = document.getElementById(newId);

                    if (newCell === null || newCell.className.indexOf('opened') > 0) continue;

                    sapperObject.openCell(newCell);
                }
            }
        }
    },
    openCellAction: function(e) {
        if (e.target && e.target.classList.contains('cell')) {
            sapperObject.openCell(e.target);
        }
    },
    setFlagAction: function(e) {
        e.preventDefault();
        var cell = e.target;

        if (cell.classList.contains('opened')) return;

        if (cell.classList.contains('flag')) {
            cell.classList.remove('flag');
            sapperObject.flagsCount--;
        } else {
            cell.classList.add('flag');
            sapperObject.flagsCount++;
        }

        sapperObject.setInfo();
    },
    checkOnWin: function() {
        if (this.cellsOpened == this.width*this.height - this.bombsCount) {
            sapperObject.stopEvents();
            alert('You win! Congratulations!');

            return true; // STOP GAME USER WINS
        }

        return false;

    },
    cellIsBomb: function(cell, isSiblings) {
        if (cell === null) return false;

        if (this.bombsArray.indexOf(cell.id) >= 0) {
            if (!isSiblings) {
                sapperObject.stopEvents();

                for (var i = 0; i < this.bombsArray.length; i++) {
                    var bombElem = document.getElementById(this.bombsArray[i]);
                    bombElem.classList.add('bombInside');
                }

                alert('You lose!');
            }

            return true;
        }
    },
    restartGameAction: function(e) {
        window.location.reload();
    },
    cellClickListener: function() {
        document.getElementById('sapper').addEventListener('click', this.openCellAction);
    },
    cellRightClickListener: function() {
        document.getElementById('sapper').addEventListener('contextmenu', this.setFlagAction);
    },
    restartBtnListener: function() {
        document.getElementById('restart').addEventListener('click', this.restartGameAction);
    },
    getGameSettingsFromUser: function() {
        document.body.style.display = 'none';
        var difficulty = prompt('Type please difficulty you want to play! Levels: '+ configHelper.gameLevels.join(' | '), 'Bruce Li');

        if (difficulty === null) {
            document.getElementById('sapper').style.display = 'none';
        } else {
            if (configHelper.gameLevels.indexOf(difficulty) < 0) {
                this.getGameSettingsFromUser();
                return;
            }

            this.height = configHelper.playgroundConf[difficulty].height;
            this.width  = configHelper.playgroundConf[difficulty].width;
            this.bombs  = configHelper.bombsPerDiff[difficulty];
            document.getElementById('sapper').style.width = this.width*42 + 'px';
            document.getElementById('sapper').style.height = this.height*42 + 'px';
        }

        document.body.style.display = '';
    },
    init : function() {
        this.getGameSettingsFromUser();
        this.renderCells();
        this.setInfo();
        this.cellClickListener();
        this.cellRightClickListener();
    }
}

// start game
sapperObject.init();
