function simplexMinimizacion(data) {
    const { numVars, numConstraints, optimization, objective, constraints } = data;

    // Preparar la tabla simplex
    let tableau = [];
    let numRows = numConstraints + 1;
    let numCols = numVars + numConstraints + 1;

    // Inicializar la tabla con ceros
    for (let i = 0; i < numRows; i++) {
        tableau[i] = new Array(numCols).fill(0);
    }

    // Configurar la función objetivo
    // Para minimización, multiplicamos los coeficientes por -1
    // Para maximización, dejamos los coeficientes como están
    for (let i = 0; i < numVars; i++) {
        tableau[0][i] = optimization === 'Minimizar' ? -objective[i] : objective[i];
    }

    // Agregar restricciones
    for (let i = 1; i < numRows; i++) {
        const constraint = constraints[i - 1];
        for (let j = 0; j < numVars; j++) {
            tableau[i][j] = constraint.coefficients[j];
        }

        // Agregar variables de holgura
        tableau[i][numVars + i - 1] = 1; // Solo soportamos restricciones con <=

        // Agregar término independiente
        tableau[i][numCols - 1] = constraint.value;
    }

    // Ejecutar el algoritmo simplex
    const solution = simplexAlgorithm(tableau);

    // Calcular el valor óptimo de la función objetivo
    let optimalValue = tableau[0][numCols - 1];
    if (optimization === 'Minimizar') {
        optimalValue = -optimalValue;
    }

    return { solution, optimalValue };
}

function simplexAlgorithm(tableau) {
    const numRows = tableau.length;
    const numCols = tableau[0].length;
    const epsilon = 1e-8;

    while (true) {
        // Encontrar la columna pivote (variable entrante)
        let pivotCol = -1;
        let minValue = 0;
        for (let j = 0; j < numCols - 1; j++) {
            if (tableau[0][j] < minValue - epsilon) {
                minValue = tableau[0][j];
                pivotCol = j;
            }
        }

        // Si no hay negativos en la fila 0, hemos terminado
        if (pivotCol === -1) {
            break;
        }

        // Encontrar la fila pivote (variable saliente)
        let pivotRow = -1;
        let minRatio = Infinity;
        for (let i = 1; i < numRows; i++) {
            if (tableau[i][pivotCol] > epsilon) {
                const ratio = tableau[i][numCols - 1] / tableau[i][pivotCol];
                if (ratio < minRatio) {
                    minRatio = ratio;
                    pivotRow = i;
                }
            }
        }

        // Si no hay fila pivote, la solución es ilimitada
        if (pivotRow === -1) {
            throw new Error('El problema tiene una solución ilimitada.');
        }

        // Realizar operaciones de pivoteo
        pivot(tableau, pivotRow, pivotCol);
    }

    // Extraer la solución básica
    const numVars = tableau[0].length - tableau.length; // Número de variables originales
    const solution = new Array(numVars).fill(0);
    for (let j = 0; j < numVars; j++) {
        let isBasic = false;
        let basicRow = -1;
        for (let i = 1; i < numRows; i++) {
            if (Math.abs(tableau[i][j] - 1) < epsilon) {
                if (isBasic) {
                    isBasic = false;
                    break;
                } else {
                    isBasic = true;
                    basicRow = i;
                }
            } else if (Math.abs(tableau[i][j]) > epsilon) {
                isBasic = false;
                break;
            }
        }
        if (isBasic) {
            solution[j] = tableau[basicRow][tableau[0].length - 1];
        }
    }

    return solution;
}

function pivot(tableau, pivotRow, pivotCol) {
    const numRows = tableau.length;
    const numCols = tableau[0].length;
    const pivotValue = tableau[pivotRow][pivotCol];

    // Dividir la fila pivote por el elemento pivote
    for (let j = 0; j < numCols; j++) {
        tableau[pivotRow][j] /= pivotValue;
    }

    // Restar múltiplos de la fila pivote a otras filas
    for (let i = 0; i < numRows; i++) {
        if (i !== pivotRow) {
            const factor = tableau[i][pivotCol];
            for (let j = 0; j < numCols; j++) {
                tableau[i][j] -= factor * tableau[pivotRow][j];
            }
        }
    }
}

