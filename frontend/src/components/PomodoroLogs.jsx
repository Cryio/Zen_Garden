import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function PomodoroLogs({ logs }) {
  return (
    <Card className="border-wax-flower-200/20 dark:border-wax-flower-100/20">
      <CardHeader>
        <CardTitle className="text-wax-flower-200 dark:text-wax-flower-100">
          Session History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-wax-flower-400 dark:text-wax-flower-300 text-center py-4">
            No sessions recorded yet
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-wax-flower-200 dark:text-wax-flower-100">Date</TableHead>
                <TableHead className="text-wax-flower-200 dark:text-wax-flower-100">Start Time</TableHead>
                <TableHead className="text-wax-flower-200 dark:text-wax-flower-100">Duration</TableHead>
                <TableHead className="text-wax-flower-200 dark:text-wax-flower-100">Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log, index) => (
                <TableRow key={index}>
                  <TableCell className="text-wax-flower-400 dark:text-wax-flower-300">
                    {new Date(log.startTime).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-wax-flower-400 dark:text-wax-flower-300">
                    {new Date(log.startTime).toLocaleTimeString()}
                  </TableCell>
                  <TableCell className="text-wax-flower-400 dark:text-wax-flower-300">
                    {formatDuration(log.duration)}
                  </TableCell>
                  <TableCell className="text-wax-flower-400 dark:text-wax-flower-300">
                    {log.type}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
} 