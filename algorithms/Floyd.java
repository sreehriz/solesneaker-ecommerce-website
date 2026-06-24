package algorithms;

public class Floyd {
    private static final double INF = 99999.0; // Use a distinct value for infinity

    /**
     * Computes all-pairs shortest paths using Floyd's algorithm.
     * @param distMatrix Initial weight adjacency matrix (INF representing no edge)
     * @return 2D array representing shortest distances between all pairs of vertices
     */
    public static double[][] computeAllPairsShortestPath(double[][] distMatrix) {
        if (distMatrix == null) return null;
        int n = distMatrix.length;
        double[][] dist = new double[n][n];

        // Initialize distance matrix
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                dist[i][j] = distMatrix[i][j];
            }
        }

        // Apply Floyd's algorithm
        for (int k = 0; k < n; k++) {
            for (int i = 0; i < n; i++) {
                for (int j = 0; j < n; j++) {
                    if (dist[i][k] != INF && dist[k][j] != INF) {
                        if (dist[i][k] + dist[k][j] < dist[i][j]) {
                            dist[i][j] = dist[i][k] + dist[k][j];
                        }
                    }
                }
            }
        }

        return dist;
    }
}
