export default class Matrix {

    /**
     * Максимальное допустимое количество строк в матрице
     * @type {number}
     */
    static MAX_ROWS = 10;

    /**
     * Максимальное допустимое количество столбцов в матрице
     * @type {number}
     */
    static MAX_COLS = 10;

    /**
     * Минимальное допустимое значение в матрице, 8bit signed = [-128..127] для Int8Array
     * @type {number}
     */
    static MIN_NUMBER = -128;

    /**
     * Максимальное допустимое значение в матрице, 8bit signed = [-128..127] для Int8Array
     * @type {number}
     */
    static MAX_NUMBER = 127;

    /**
     * Содержит значение матрицы
     * @type {Int8Array}
     * @private
     */
    _matrix;

    /**
     * Ширина матрицы
     * @type {number}
     * @private
     */
    _width = 0;

    /**
     * Высота матрицы
     * @type {number}
     * @private
     */
    _height = 0;

    /**
     * @param {number} width
     * @param {number} height
     */
    constructor(width, height) {
        if (( width > Matrix.MAX_COLS ) || ( height > Matrix.MAX_ROWS))
            throw new Error("The maximum number of rows or columns allowed has been exceeded");
        if ( width < 1 || height < 1 )
            throw new Error("The value for rows and columns must be greater than zero");

        this._width = width;
        this._height = height;

        this._matrix = new Int8Array(width * height);
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    /**
     * Заполняет матрицы случайными числами в диапозоне от min до max
     * @param { number } min
     * @param { number } max
     * @return Matrix
     */
    fillRand( min, max) {
        if (( min < Matrix.MIN_NUMBER ) || (max > Matrix.MAX_NUMBER))
            throw new Error("Выход за диапозон допустимых значений");
        if ( min > max )
            throw new Error("Минимум не должен быть больше максимума");

        this._matrix = this._matrix.map(() => Math.floor(Math.random() * (max - min + 1)) + min);

        return this;
    }

    /**
     * Возвращает строку матрицы с номер row, нумерация с нуля!
     * @param {number} row
     * @return Int8Array
     */
    getRow(row) {
        if ( row < 0 )
            throw new Error(`Строка должна быть положительным число или нулем`);
        if ( row >= this._height )
            throw new Error(`Строка ${row} больше допустимого значения ${this.height -1}`);
        return this._matrix
            .slice( row * this._width, (row + 1) * this._width);
    }

    /**
     * Возвращает
     * @return number
     */
    findMinFigRow() {
        let min = Math.min(...this._matrix);
        const index = this._matrix.findIndex( v => v === min );
        return Math.floor(index / this._width);
    }

    /**
     * Возвращает для каждой строки наименьшее положительное число
     * @return Int8Array
     */
    minPositiveNumberForRows() {
        const minFigRow = new Int8Array(this.height);
        for (let i = 0; i < this.height; i++)
            minFigRow[i] = Math.min(...this.getRow(i).filter(v => v > 0));
        return minFigRow;
    }

    /**
     * Возвращает количество чисел для каждой строки матрицы,
     * которое необходимо заменить в этой строке, для того,
     * что бы не встречалось 3х положительных или отрицательных чисел подряд.
     * @return {Int8Array}
     */
    countReplaceForRows() {
        const countReplaces = new Int8Array(this._height);
        for (let row = 0; row < this.height; row++) {
            [...this.getRow(row), 0] // К строке матрицы добавим 0, что бы условия в reduce могло могло выполнится для последнего элемента строки
                .map(Math.sign) // Для удовства вычисления, все числа сделаем в дипозоне [-1, 0, 1], см. sign
                .reduce((lenSequence, curr) => {
                // признак окончания последовательности одного знака чисел,
                // это появление нуля или числа с протиположным знаком.
                // т.к. мы имеем дело с числами -1, 0, +1, то смену знака можно вычислить.
                let newV = lenSequence * Math.abs(curr) * Math.abs(Math.sign(Math.sign(lenSequence) + curr));
                if ( newV === 0 ) countReplaces[row] += Math.floor(Math.abs(lenSequence) / 3);
                return newV + curr;
            })
        }

        return countReplaces;
    }

    /**
     * Выводи матрицу как строку.
     * @description По своей сути представление матрицы на консоле в соответствии с ТЗ
     *              Правильнее было бы представление убрать из текущего класса, но в рамках тествого задания считаю допустимым,
     *              не пладить дополнительной сущности для представления данных.
     * @return {string}
     */
    toString() {
        let str = "";

        const minPositives = this.minPositiveNumberForRows();
        const replaces = this.countReplaceForRows();
        const minInRow = this.findMinFigRow();

        for (let row = 0; row < this.height; row++) {
            let advCols = [minInRow === row ? "*" : " ", this._spacing(minPositives[row]), replaces[row]];
            str += [...this.getRow(row)]
                    .map( s => this._spacing(s))
                    .join(" ")
                + " | " + advCols.join(" | ") + "\n";
        }
        return str;
    }

    /**
     * Добавление в начало строки str, count пробелов.
     * @description по сути это должно быть в Helper, в рамках ТЗ считаю приемлемым тут.
     * @param {string} str
     * @param {number} count
     * @return {string}
     * @private
     */
    _spacing(str, count = 4) {
        return (" ".repeat(count) + str).slice(count * (-1));
    }

}