package algorithms;

import java.util.*;

public class NQueens {
    /**
     * Solves the N-Queens problem and returns all solutions.
     * @param n Size of the board (number of queens)
     * @return List of solutions, where each solution is an array representing queen column positions by row
     */
    public static List<int[]> solve(int n) {
        List<int[]> solutions = new ArrayList<>();
        if (n <= 0) return solutions;
        int[] board = new int[n]; // board[i] represents the column of the queen in row i
        solveNQueens(0, board, n, solutions);
        return solutions;
    }

    private static void solveNQueens(int row, int[] board, int n, List<int[]> solutions) {
        if (row == n) {
            // Found a solution, save a copy of the board
            solutions.add(board.clone());
            return;
        }

        for (int col = 0; col < n; col++) {
            if (isSafe(row, col, board)) {
                board[row] = col;
                solveNQueens(row + 1, board, n, solutions);
                // Backtrack (implicit since we overwrite board[row] in next iterations)
            }
        }
    }

    private static boolean isSafe(int row, int col, int[] board) {
        for (int i = 0; i < row; i++) {
            int otherCol = board[i];
            // Check same column
            if (otherCol == col) {
                return false;
            }
            // Check diagonals
            if (Math.abs(otherCol - col) == Math.abs(i - row)) {
                return false;
            }
        }
        return true;
    }
}
