package algorithms;

public class Warshall {
    /**
     * Computes the transitive closure of a graph represented by an adjacency matrix.
     * @param adjMatrix Adjacency matrix where adjMatrix[i][j] = 1 if edge i -> j exists, else 0
     * @return 2D array representing the transitive closure (reachability matrix)
     */
    public static int[][] computeTransitiveClosure(int[][] adjMatrix) {
        if (adjMatrix == null) return null;
        int n = adjMatrix.length;
        int[][] tc = new int[n][n];

        // Initialize reachability matrix with the adjacency matrix
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                tc[i][j] = adjMatrix[i][j];
            }
        }

        // Apply Warshall's algorithm
        for (int k = 0; k < n; k++) {
            for (int i = 0; i < n; i++) {
                for (int j = 0; j < n; j++) {
                    // tc[i][j] is 1 if it was already reachable, or if reachable via node k
                    if (tc[i][j] == 1 || (tc[i][k] == 1 && tc[k][j] == 1)) {
                        tc[i][j] = 1;
                    }
                }
            }
        }

        return tc;
    }
}
