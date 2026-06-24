package algorithms;

import java.util.*;

public class Dijkstra {
    public static class Edge {
        public String target;
        public double weight;

        public Edge(String target, double weight) {
            this.target = target;
            this.weight = weight;
        }
    }

    public static class PathResult {
        public List<String> path;
        public double totalDistance;

        public PathResult(List<String> path, double totalDistance) {
            this.path = path;
            this.totalDistance = totalDistance;
        }
    }

    public static PathResult findShortestPath(Map<String, List<Edge>> graph, String start, String end) {
        if (!graph.containsKey(start)) {
            return new PathResult(new ArrayList<>(), -1);
        }

        Map<String, Double> distances = new HashMap<>();
        Map<String, String> parentMap = new HashMap<>();
        PriorityQueue<Map.Entry<String, Double>> pq = new PriorityQueue<>(Comparator.comparingDouble(Map.Entry::getValue));

        for (String node : graph.keySet()) {
            distances.put(node, Double.MAX_VALUE);
        }
        distances.put(start, 0.0);
        pq.add(new AbstractMap.SimpleEntry<>(start, 0.0));

        while (!pq.isEmpty()) {
            Map.Entry<String, Double> current = pq.poll();
            String u = current.getKey();
            double distU = current.getValue();

            if (distU > distances.getOrDefault(u, Double.MAX_VALUE)) {
                continue;
            }

            if (u.equals(end)) {
                break;
            }

            List<Edge> edges = graph.get(u);
            if (edges != null) {
                for (Edge edge : edges) {
                    String v = edge.target;
                    double weight = edge.weight;

                    // Ensure target node is tracked in distances if it wasn't explicitly in graph keys
                    if (!distances.containsKey(v)) {
                        distances.put(v, Double.MAX_VALUE);
                    }

                    double newDist = distU + weight;
                    if (newDist < distances.get(v)) {
                        distances.put(v, newDist);
                        parentMap.put(v, u);
                        pq.add(new AbstractMap.SimpleEntry<>(v, newDist));
                    }
                }
            }
        }

        double finalDistance = distances.getOrDefault(end, Double.MAX_VALUE);
        if (finalDistance == Double.MAX_VALUE) {
            return new PathResult(new ArrayList<>(), -1);
        }

        List<String> path = new ArrayList<>();
        String current = end;
        while (current != null) {
            path.add(0, current);
            current = parentMap.get(current);
        }

        return new PathResult(path, finalDistance);
    }
}
