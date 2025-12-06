"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TestResult {
  success?: boolean;
  error?: string;
  message?: string;
  size?: string | null;
  type?: string | null;
  audioFiles?: string[];
}

export default function TestAudioPage() {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);

  const testAudioAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/test-audio");
      const result = await response.json();
      setTestResult(result);
      console.log("Test audio result:", result);
    } catch (error) {
      console.error("Test audio error:", error);
      setTestResult({ error: "Failed to test audio API" });
    } finally {
      setLoading(false);
    }
  };

  const testSpecificAudio = async (filename: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/audio/${filename}`);
      if (response.ok) {
        setTestResult({
          success: true,
          message: `Audio file ${filename} is accessible`,
          size: response.headers.get("Content-Length"),
          type: response.headers.get("Content-Type"),
        });
      } else {
        const error = await response.json();
        setTestResult({
          error: `Failed to access ${filename}: ${error.error}`,
        });
      }
    } catch (error) {
      console.error("Test specific audio error:", error);
      setTestResult({ error: `Failed to test ${filename}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Audio API Test Page</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Audio Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={testAudioAPI} disabled={loading} className="mb-4">
              {loading ? "Testing..." : "Test Audio Directory"}
            </Button>

            {testResult && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <h3 className="font-semibold mb-2">Test Result:</h3>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {testResult?.audioFiles && testResult.audioFiles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Individual Audio Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {testResult.audioFiles.slice(0, 5).map((filename: string) => (
                  <Button
                    key={filename}
                    onClick={() => testSpecificAudio(filename)}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                    className="mr-2"
                  >
                    Test {filename}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
