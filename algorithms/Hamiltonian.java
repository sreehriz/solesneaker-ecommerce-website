package algorithms;

import java.util.*;

public class Hamiltonian {
    /**
     * Finds a Hamiltonian Circuit in a graph represented by an adjacency matrix.
     * @param adjMatrix Graph represented by an adjacency matrix (1 if edge, 0 otherwise)
     * @return List of vertex indices forming the cycle (starting and ending at 0), or empty if none exists
     */
    public static List<Integer> findCycle(int[][] adjMatrix) {
        List<Integer> result = new ArrayList<>();
        if (adjMatrix == null || adjMatrix.length == 0) return result;
        int n = adjMatrix.length;
        int[] path = new int[n];
        Arrays.fill(path, -1);

        // Start at vertex 0
        path[0] = 0;
        if (solveHamiltonian(adjMatrix, path, 1, n)) {
            for (int node : path) {
                result.add(node);
            }
            result.add(0); // Complete the cycle
        }
        return result;
    }

    private static boolean solveHamiltonian(int[][] adjMatrix, int[] path, int pos, int n) {
        // Base case: all vertices are included in path
        if (pos == n) {
            // Check if there is an edge from the last vertex to the first vertex
            return adjMatrix[path[pos - 1]][path[0]] == 1;
        }

        // Try different vertices as candidates
        for (int v = 1; v < n; v++) {
            if (isSafe(v, adjMatrix, path, pos)) {
                path[pos] = v;
                if (solveHamiltonian(adjMatrix, path, pos + 1, n)) {
                    return true;
                }
                // Backtrack
                path[pos] = -1;
            }
        }

        return false;
    }

    private static boolean isSafe(int v, int[][] adjMatrix, int[] path, int pos) {
        // Check if this vertex is adjacent to the previously added vertex
        if (adjMatrix[path[pos - 1]][v] == 0) {
            return false;
        }

        // Check if the vertex has already been included
        for (int i = 0; i < pos; i++) {
            if (path[i] == v) {
                return false;
            }
        }

        return true;
    }
}
