/* MADE BY XUTEBOX PLEASE PROVIDE CREDIT IF USING MY CODE */

let lightsolve
let lightsgrid

const LGrid = document.getElementById('lightsgrid')
const SGrid = document.getElementById('solutiongrid')
const Restart = document.getElementById('restart')
const SolveOn = document.getElementById('solveOn')
const SolveOff = document.getElementById('solveOff')
const SolveMid = document.getElementById('solveMid')
let inactiveFields = [0, 2, 4, 6, 14, 19, 20, 28, 29, 34, 42, 44, 46, 48]

Restart.addEventListener('click', function () {
    lightsgrid = new LightsGrid()
    lightsolve = new LightsOutSolver()
    lightsgrid.innit()
    lightsolve.innit()

})

SolveOff.addEventListener('click', function () {
    if (lightsgrid == null || lightsolve == null) {
        return
    }
    lightsolve = new LightsOutSolver(lightsgrid.deepCopyGrid());
    lightsolve.innit()
    lightsolve.solveOff()

})

SolveOn.addEventListener('click', function () {
    if (lightsgrid == null || lightsolve == null) {
        return
    }
    lightsolve = new LightsOutSolver(lightsgrid.deepCopyGrid());
    lightsolve.innit()
    lightsolve.solveOn()

})

SolveMid.addEventListener('click', function () {
    if (lightsgrid == null || lightsolve == null) {
        return
    }
    lightsolve = new LightsOutSolver(lightsgrid.deepCopyGrid());
    lightsolve.innit()
    lightsolve.solveMid()

})

LGrid.addEventListener('click', function (event) {
    if (event.target !== LGrid) {
        const clickedElement = event.target
        let clickedPosition = Array.from(LGrid.children).indexOf(clickedElement)
        lightsgrid.clicked(clickedPosition)
    }
})

LGrid.addEventListener('contextmenu', function (event) {
    event.preventDefault()
    if (event.target !== LGrid) {
        const clickedElement = event.target
        let clickedPosition = Array.from(LGrid.children).indexOf(clickedElement)
        lightsgrid.edit(clickedPosition)
    }
})

class Type {
    state
    disabled
    constructor(state, disabled) {
        this.state = state
        this.disabled = disabled
    }
}


class LightsGrid {
    grid
    constructor() {
        this.grid = new Array(7).fill(null).map(() => new Array(7).fill(null));
    }

    innit() {
        LGrid.innerHTML = '';
        for (let i = 0; i < 49; i++) {
            const div = document.createElement('div');
            div.classList.add('tile');
            LGrid.appendChild(div);
        }

        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 7; j++) {
                let isDisabled = false;

                for (let tile of inactiveFields) {
                    if (tile === this.toIndex(i, j)) {
                        isDisabled = true;
                        break;
                    }
                }

                this.grid[j][i] = new Type(false, isDisabled);
            }
        }
        this.updateView();
    }



    clicked(index) {
        let coords = this.toCoords(index)
        if (this.grid[coords.y][coords.x].disabled) {
            return
        }
        this.operate(coords.x, coords.y)
        this.updateView()
    }

    operate(x, y) {
        this.grid[y][x].state = !this.grid[y][x].state
        if (this.isValid(x - 1, y)) {
            this.grid[y][x - 1].state = !this.grid[y][x - 1].state
        }
        if (this.isValid(x + 1, y)) {
            this.grid[y][x + 1].state = !this.grid[y][x + 1].state
        }
        if (this.isValid(x, y - 1)) {
            this.grid[y - 1][x].state = !this.grid[y - 1][x].state
        }
        if (this.isValid(x, y + 1)) {
            this.grid[y + 1][x].state = !this.grid[y + 1][x].state
        }
    }

    edit(index) {
        let coords = this.toCoords(index)
        if (this.grid[coords.y][coords.x].disabled) {
            return
        }
        this.grid[coords.y][coords.x].state = !this.grid[coords.y][coords.x].state
        this.updateView()
    }

    updateView() {
        let lights = document.querySelectorAll('.tile')
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 7; j++) {
                let index = this.toIndex(i, j)
                lights[index].classList = ['tile']
                if (this.grid[j][i].state) {
                    lights[index].classList.add('on')
                } else if (!this.grid[j][i].state) {
                    lights[index].classList.add('off')
                } else {
                    console.log('unknown value')
                }
                if (this.grid[j][i].disabled) {
                    lights[index].classList.add('disabled')
                }
            }
        }

    }


    toCoords(index) {
        let x = index % 7
        let y = Math.floor(index / 7)
        return { x: x, y: y }
    }

    toIndex(x, y) {
        return y * 7 + x
    }

    isValid(x, y) {
        return x >= 0 && x < 7 && y >= 0 && y < 7 && !this.grid[y][x].disabled;
    }
    deepCopyGrid() {
        return this.grid.map(row => row.map(cell => ({ ...cell })));
    }
}

class SolType {
    value
    constructor(value) {
        this.value = 0
    }
}

class LightsOutSolver {
    grid
    solutiongrid
    constructor(grid) {
        this.grid = grid
        this.solutiongrid = new Array(7).fill(null).map(() => new Array(7).fill(null));
    }

    innit() {
        SGrid.innerHTML = ''
        for (let i = 0; i < 49; i++) {
            const div = document.createElement('div')
            div.classList.add('soltile')
            SGrid.appendChild(div)
        }
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 7; j++) {
                this.solutiongrid[j][i] = new SolType(0)
            }
        }
    }

    solveOff() {
        if (!this.checkState(2)){
            return
        }
        this.doSpecialTopCases()
        this.checkRows()
        this.doSpecialMidCases()
        this.checkRows()
        this.doSpecialBotCases()
        this.checkRows()
        this.doSpecialLastCases()
        this.checkRows()
        this.doSpecialBotCases()
        this.checkRows()
        this.roundValues()
        this.updateValues()
    }

    solveOn(){
        if (!this.checkState(1)){
            return
        }
        this.doSpecialTopCases()
        this.checkRows()
        this.doSpecialMidCases()
        this.checkRows()
        this.doSpecialBotCases()
        this.checkRows()
        this.doSpecialLastCases()
        this.checkRows()
        this.doSpecialBotCases()
        this.checkRows()
        this.toOn()
        this.roundValues()
        this.updateValues()
    }

    solveMid(){
        if (!this.checkState(0)){
            return
        }
        this.doSpecialTopCases()
        this.checkRows()
        this.doSpecialMidCases()
        this.checkRows()
        this.doSpecialBotCases()
        this.checkRows()
        this.doSpecialLastCases()
        this.checkRows()
        this.doSpecialBotCases()
        this.checkRows()
        this.toOn()
        this.toMid()
        this.roundValues()
        this.updateValues()
    }

    checkState(onmid){
        let check = 0
        if (onmid == 1){
            for (let j = 0; j < 7; j++) {
                for (let i = 0; i < 7; i++) {
                    if (!this.grid[j][i].state && this.isValid(i, j)){
                        check++
                    }
                }
                
            }
            if (check != 0){
                return true
            }
            else{
                return false
            }
        }
        else if (onmid == 0) {
            for (let j = 0; j < 7; j++) {
                for (let i = 0; i < 7; i++) {
                    if (this.grid[j][i].state){
                        check++
                    }
                }
                
            }
            if (this.grid[3][3].state && check == 1){
                return false
            }
            else{
                return true
            }
        }
        else {
            for (let j = 0; j < 7; j++) {
                for (let i = 0; i < 7; i++) {
                    if (this.grid[j][i].state && this.isValid(i, j)){
                        check++
                    }
                }
                
            }
            if (check != 0){
                return true
            }
            else{
                return false
            }
        }
    }

    doSpecialTopCases() {
        switch (this.grid[0][1].state) {
            case false:
                if (this.grid[1][0].state) {
                    this.operate(0, 1)
                }
                break
            case true:
                if (this.grid[1][0].state) {
                    this.operate(0, 1)
                    this.operate(1, 0)
                }
                else {
                    this.operate(0, 1)
                    this.operate(2, 1)
                }
                break
        }
        switch (this.grid[0][5].state) {
            case false:
                if (this.grid[1][6].state) {
                    if (this.grid[1][5].state) {
                        this.operate(6, 1)
                    }
                    else {
                        this.operate(5, 1)
                        this.operate(5, 0)
                    }

                }
                else if (this.grid[1][5].state) {
                    this.operate(5, 1)
                    this.operate(5, 0)
                    this.operate(6, 1)
                }
                break
            case true:
                if (!this.grid[1][6].state) {
                    if (this.grid[1][5].state) {
                        this.operate(5, 0)
                    }
                    else {
                        this.operate(6, 1)
                        this.operate(5, 1)
                    }

                }
                else {
                    if (this.grid[1][5].state) {
                        this.operate(5, 1)
                        break
                    }
                    this.operate(6, 1)
                    this.operate(5, 0)
                }
                break
        }
    }

    doSpecialMidCases() {
        switch (this.grid[3][0].state) {
            case false:
                if (this.grid[3][1].state) {
                    this.specialMid()
                }
                break
            case true:
                if (this.grid[3][1].state) {
                    this.operate(0, 3)
                }
                else {
                    this.operate(0, 3)
                    this.specialMid()
                }
                break
        }
        if (this.grid[3][6].state) {
            this.operate(6, 3)
        }
    }

    doSpecialBotCases() {
        if (this.grid[5][2].state) {
            this.operate(0, 5)
            this.operate(1, 5)
        }
        if (this.grid[5][6].state) {
            this.operate(6, 5)
            this.operate(5, 6)
        }
        if (this.grid[5][0].state) {
            this.operate(0, 5)
            this.operate(1, 6)
        }
        if (this.grid[5][4].state) {
            this.specialBot()
        }
    }

    doSpecialLastCases() {
        if (this.grid[6][1].state && this.grid[6][3].state && this.grid[6][5].state) {
            this.operate(5, 3)
            this.operate(6, 3)
            this.operate(3, 6)
        }
        else if (!this.grid[6][1].state && this.grid[6][3].state && this.grid[6][5].state) {
            this.operate(3, 0)
            this.operate(3, 1)
            this.operate(2, 1)
            this.operate(3, 2)
            this.operate(4, 2)
            this.operate(1, 2)
            this.operate(0, 3)
            this.operate(1, 3)
            this.operate(2, 3)
            this.operate(3, 3)
            this.operate(2, 4)
            this.operate(3, 4)
            this.operate(0, 5)
            this.operate(1, 5)
            this.operate(2, 5)
            this.operate(3, 5)
            this.operate(4, 5)
            this.operate(1, 6)
            this.operate(5, 6)
        }
        else if (this.grid[6][1].state && !this.grid[6][3].state && !this.grid[6][5].state) {
            this.operate(5, 0)
            this.operate(2, 1)
            this.operate(4, 1)
            this.operate(5, 1)
            this.operate(6, 1)
            this.operate(1, 2)
            this.operate(2, 2)
            this.operate(2, 3)
            this.operate(3, 3)
            this.operate(4, 3)
            this.operate(5, 3)
            this.operate(6, 3)
            this.operate(2, 4)
            this.operate(3, 4)
            this.operate(4, 4)
            this.operate(5, 4)
            this.operate(2, 5)
            this.operate(5, 5)
            this.operate(6, 5)
            this.operate(1, 6)
            this.operate(5, 6)
        }
    }

    specialMid() {
        this.operate(3, 2)
        this.operate(2, 3)
        this.operate(4, 1)
        this.operate(5, 0)
        this.operate(5, 1)
        this.operate(6, 1)
    }

    specialBot() {
        this.operate(3, 5)
        this.operate(2, 4)
        this.operate(1, 3)
        this.operate(1, 1)
        this.operate(0, 1)
        this.operate(1, 0)
        this.operate(1, 2)
        this.operate(2, 2)
        this.operate(0, 3)
        this.specialMid()
    }

    toOn(){
        this.operate(3, 0)
        this.operate(5, 0)
        this.operate(1, 1)
        this.operate(4, 1)
        this.operate(6, 1)
        this.operate(3, 2)
        this.operate(0, 3)
        this.operate(4, 3)
        this.operate(6, 3)
        this.operate(2, 4)
        this.operate(3, 4)
        this.operate(5, 4)
        this.operate(0, 5)
        this.operate(2, 5)
        this.operate(3, 5)
        this.operate(6, 5)
        this.operate(1, 6)
        this.operate(5, 6)
    }

    toMid(){
        this.operate(1, 1)
        this.operate(3, 1)
        this.operate(5, 1)
        this.operate(2, 2)
        this.operate(4, 2)
        this.operate(1, 3)
        this.operate(5, 3)
        this.operate(2, 4)
        this.operate(4, 4)
        this.operate(1, 5)
        this.operate(3, 5)
        this.operate(5, 5)
    }

    checkRows() {
        for (let j = 0; j < 7; j++) {
            for (let i = 0; i < 7; i++) {
                if (this.grid[j][i].state) {
                    this.operate(i, j + 1)
                }
            }

        }
    }

    operate(x, y) {
        if (this.isValid(x, y)) {
            this.grid[y][x].state = !this.grid[y][x].state;
            this.solutiongrid[y][x].value++

            if (this.isValid(x - 1, y)) {
                this.grid[y][x - 1].state = !this.grid[y][x - 1].state;
            }
            if (this.isValid(x + 1, y)) {
                this.grid[y][x + 1].state = !this.grid[y][x + 1].state;
            }
            if (this.isValid(x, y - 1)) {
                this.grid[y - 1][x].state = !this.grid[y - 1][x].state;
            }
            if (this.isValid(x, y + 1)) {
                this.grid[y + 1][x].state = !this.grid[y + 1][x].state;
            }
        } else {
            return;
        }
    }

    roundValues() {
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 7; j++) {
                if (this.isOdd(this.solutiongrid[j][i].value)) {
                    this.solutiongrid[j][i].value = 1
                }
                else if (this.isEven(this.solutiongrid[j][i].value)) {
                    this.solutiongrid[j][i].value = 0
                }
                else {
                    console.log('Unknown solutiongrid.value');
                }
            }
        }
    }


    updateValues() {
        let tiles = document.querySelectorAll('.soltile')
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 7; j++) {
                let index = this.toIndex(i, j)
                tiles[index].innerHTML = this.solutiongrid[j][i].value
            }
        }
        let lights = document.querySelectorAll('.soltile')
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 7; j++) {
                let index = this.toIndex(i, j)
                lights[index].classList = ['soltile']
                if (this.grid[j][i].state) {
                    lights[index].classList.add('on')
                } else if (!this.grid[j][i].state) {
                    lights[index].classList.add('off')
                } else {
                    console.log('unknown value')
                }
                if (this.grid[j][i].disabled) {
                    lights[index].classList.add('disabled')
                }
            }
        }
    }

    toCoords(index) {
        let x = index % 7
        let y = Math.floor(index / 7)
        return { x: x, y: y }
    }

    toIndex(x, y) {
        return y * 7 + x
    }

    isValid(x, y) {
        return x >= 0 && x < 7 && y >= 0 && y < 7 && !this.grid[y][x].disabled;
    }
    isOdd(number) {
        return number % 2 !== 0;
    }

    isEven(number) {
        return number % 2 === 0;
    }
}