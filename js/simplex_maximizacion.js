// Archivo: js/simplex_maximizacion.js

function simplexMaximizacion(data) {
    const { numVars, numConstraints, objective, constraints } = data;

    // Crear la tabla simplex inicial
    const tableau = createTableau(numVars, numConstraints, objective, constraints, false);

    console.log("Tabla inicial de maximización:", tableau);

    // Ejecutar el algoritmo Simplex
    try {
        const result = runSimplexAlgorithm(tableau);

        // Extraer el valor óptimo
        const optimalValue = result.optimalValue;
        console.log("Tabla final de maximización:", tableau);

        return { solution: result.solution, optimalValue };
    } catch (error) {
        console.error("Error en maximización:", error.message);
        throw error;
    }
}

function createTableau(numVars, numConstraints, objective, constraints, minimize) {
    const tableau = [];
    const numCols = numVars + numConstraints + 1; // Variables originales + holguras + RHS

    // Crear las filas del tableau con ceros
    for (let i = 0; i <= numConstraints; i++) {
        tableau[i] = Array(numCols).fill(0);
    }

    // Configurar la función objetivo
    for (let i = 0; i < numVars; i++) {
        tableau[0][i] = -objective[i]; // Negar los coeficientes para maximización
    }

    // Configurar las restricciones
    for (let i = 0; i < numConstraints; i++) {
        const { coefficients, value, sign } = constraints[i];

        if (sign === ">=") {
            // Convertir la restricción >= en <= multiplicando por -1
            const convertedCoefficients = coefficients.map(coef => -coef);
            const convertedValue = -value;

            // Asignar los coeficientes convertidos
            for (let j = 0; j < numVars; j++) {
                tableau[i + 1][j] = convertedCoefficients[j];
            }
            // Agregar variable de holgura
            tableau[i + 1][numVars + i] = 1;
            // Asignar el valor del lado derecho convertido
            tableau[i + 1][numCols - 1] = convertedValue;
        } else if (sign === "<=") {
            // Asignar los coeficientes
            for (let j = 0; j < numVars; j++) {
                tableau[i + 1][j] = constraints[i].coefficients[j];
            }
            // Agregar variable de holgura
            tableau[i + 1][numVars + i] = 1;
            // Asignar el valor del lado derecho
            tableau[i + 1][numCols - 1] = value;
        } else {
            throw new Error(`Signo de restricción no soportado: ${sign}`);
        }
    }

    return tableau;
}

function runSimplexAlgorithm(tableau) {
    const numRows = tableau.length;
    const numCols = tableau[0].length;

    while (true) {
        // Buscar la columna pivote (variable entrante)
        let pivotCol = -1;
        let minValue = 0;

        for (let j = 0; j < numCols - 1; j++) {
            if (tableau[0][j] < minValue) {
                minValue = tableau[0][j];
                pivotCol = j;
            }
        }

        // Si no hay valores negativos en la fila de la función objetivo, hemos terminado
        if (pivotCol === -1) break;

        // Buscar la fila pivote (variable saliente) usando la prueba de razón mínima
        let pivotRow = -1;
        let minRatio = Infinity;

        for (let i = 1; i < numRows; i++) {
            if (tableau[i][pivotCol] > 0) {
                const ratio = tableau[i][numCols - 1] / tableau[i][pivotCol];
                if (ratio < minRatio) {
                    minRatio = ratio;
                    pivotRow = i;
                }
            }
        }

        // Si no se encuentra una fila pivote, el problema es ilimitado
        if (pivotRow === -1) throw new Error("El problema no tiene solución finita.");

        // Realizar pivoteo en la tabla
        pivot(tableau, pivotRow, pivotCol);
    }

    // Extraer la solución y el valor óptimo
    const solution = extractSolution(tableau);
    const optimalValue = tableau[0][tableau[0].length - 1];

    return { solution, optimalValue };
}

function extractSolution(tableau) {
    const numVars = tableau[0].length - tableau.length; // Número de variables originales
    const solution = Array(numVars).fill(0);

    for (let i = 0; i < numVars; i++) {
        for (let j = 1; j < tableau.length; j++) {
            if (tableau[j][i] === 1) {
                solution[i] = tableau[j][tableau[0].length - 1];
                break;
            }
        }
    }

    return solution;
}

function pivot(tableau, pivotRow, pivotCol) {
    const pivotValue = tableau[pivotRow][pivotCol];

    // Dividir la fila pivote por el valor del pivote
    for (let j = 0; j < tableau[0].length; j++) {
        tableau[pivotRow][j] /= pivotValue;
    }

    // Restar múltiplos de la fila pivote a las demás filas
    for (let i = 0; i < tableau.length; i++) {
        if (i !== pivotRow) {
            const factor = tableau[i][pivotCol];
            for (let j = 0; j < tableau[0].length; j++) {
                tableau[i][j] -= factor * tableau[pivotRow][j];
            }
        }
    }
}
