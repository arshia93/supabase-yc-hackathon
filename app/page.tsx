"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle } from "lucide-react";
import { crawlWebsite } from "./actions/crawl-website";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Crawling..." : "Crawl Website"}
    </Button>
  );
}

export default function CrawlWebsitePage() {
  const [result, setResult] = useState<any>(null);

  async function handleSubmit(formData: FormData) {
    const response = await crawlWebsite(formData);
    setResult(response);
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Track your website</CardTitle>
          <CardDescription>
            Enter your website URL to crawl and set up product analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                name="url"
                type="url"
                placeholder="https://example.com"
                required
              />
            </div>
            <SubmitButton />
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          {result && (
            <div className="w-full space-y-4">
              {result.error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{result.error}</AlertDescription>
                </Alert>
              ) : (
                <>
                  <Alert variant="default">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>{result.message}</AlertDescription>
                  </Alert>
                  <div className="space-y-2">
                    {result.results.map((item: any, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        {item.status === "success" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        )}
                        <span>{item.step}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Analytics Code</h3>
                    <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                      <code>{result.analyticsCode}</code>
                    </pre>
                  </div>
                </>
              )}
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
