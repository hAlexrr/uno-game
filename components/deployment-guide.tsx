"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Server,
  Globe,
  Code,
  Terminal,
  Database,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DeploymentGuide() {
  const [expandedStep, setExpandedStep] = useState<number | null>(null)

  const toggleStep = (stepIndex: number) => {
    if (expandedStep === stepIndex) {
      setExpandedStep(null)
    } else {
      setExpandedStep(stepIndex)
    }
  }

  const deploymentSteps = [
    {
      title: "Prerequisites",
      icon: CheckCircle,
      content: (
        <div className="space-y-2">
          <p>Before deploying, make sure you have:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Node.js v16 or higher installed</li>
            <li>npm or yarn package manager</li>
            <li>Git installed</li>
            <li>A GitHub account</li>
            <li>A Vercel account (free tier works fine)</li>
          </ul>
        </div>
      ),
    },
    {
      title: "Prepare Your Project",
      icon: Code,
      content: (
        <div className="space-y-2">
          <p>Make sure your project is ready for deployment:</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              <strong>Initialize Git repository</strong> (if not already done):
              <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 overflow-x-auto">git init</pre>
            </li>
            <li>
              <strong>Create a .gitignore file</strong> with the following content:
              <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 overflow-x-auto">
                node_modules .next .env .env.local .DS_Store
              </pre>
            </li>
            <li>
              <strong>Commit your changes</strong>:
              <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 overflow-x-auto">
                git add . git commit -m "Initial commit"
              </pre>
            </li>
          </ol>
        </div>
      ),
    },
    {
      title: "Set Up GitHub Repository",
      icon: Globe,
      content: (
        <div className="space-y-2">
          <p>Create a GitHub repository and push your code:</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Go to{" "}
              <a
                href="https://github.com/new"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                github.com/new
              </a>{" "}
              and create a new repository
            </li>
            <li>
              <strong>Link your local repository to GitHub</strong>:
              <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 overflow-x-auto">
                git remote add origin https://github.com/yourusername/your-repo-name.git git branch -M main git push -u
                origin main
              </pre>
            </li>
          </ol>
        </div>
      ),
    },
    {
      title: "Deploy to Vercel",
      icon: Server,
      content: (
        <div className="space-y-2">
          <p>Deploy your UNO game to Vercel:</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Go to{" "}
              <a
                href="https://vercel.com/import"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                vercel.com/import
              </a>
            </li>
            <li>Select "Import Git Repository" and choose your GitHub repository</li>
            <li>
              <strong>Configure project settings</strong>:
              <ul className="list-disc pl-5 mt-1">
                <li>Framework Preset: Next.js</li>
                <li>Root Directory: ./</li>
                <li>Build Command: next build</li>
                <li>Output Directory: .next</li>
              </ul>
            </li>
            <li>
              <strong>Add environment variables</strong>:
              <ul className="list-disc pl-5 mt-1">
                <li>PORT: 3000</li>
              </ul>
            </li>
            <li>Click "Deploy" and wait for the deployment to complete</li>
          </ol>
        </div>
      ),
    },
    {
      title: "Set Up WebSocket Server",
      icon: Terminal,
      content: (
        <div className="space-y-2">
          <p>For multiplayer functionality, you need to set up a WebSocket server:</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              <strong>Option 1: Deploy to a VPS (Digital Ocean, AWS, etc.)</strong>
              <ul className="list-disc pl-5 mt-1">
                <li>Set up a VPS with Node.js installed</li>
                <li>Clone your repository to the server</li>
                <li>
                  Install dependencies: <code>npm install</code>
                </li>
                <li>
                  Start the server: <code>npm start</code> or <code>node server.js</code>
                </li>
                <li>
                  Set up a process manager like PM2: <code>pm2 start server.js</code>
                </li>
              </ul>
            </li>
            <li>
              <strong>Option 2: Use a serverless WebSocket service</strong>
              <ul className="list-disc pl-5 mt-1">
                <li>Consider services like Pusher, Ably, or Socket.io Cloud</li>
                <li>Update your client code to connect to these services</li>
                <li>Follow their documentation for implementation details</li>
              </ul>
            </li>
          </ol>
        </div>
      ),
    },
    {
      title: "Configure Domain (Optional)",
      icon: Globe,
      content: (
        <div className="space-y-2">
          <p>Set up a custom domain for your UNO game:</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Purchase a domain from a registrar like Namecheap, GoDaddy, or Google Domains</li>
            <li>In your Vercel project, go to "Settings" &gt; "Domains"</li>
            <li>Add your custom domain</li>
            <li>Follow Vercel's instructions to configure DNS settings at your domain registrar</li>
            <li>Wait for DNS propagation (can take up to 48 hours)</li>
          </ol>
        </div>
      ),
    },
    {
      title: "Set Up Database (Optional)",
      icon: Database,
      content: (
        <div className="space-y-2">
          <p>For persistent data storage (user accounts, game history, etc.):</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              <strong>Option 1: MongoDB Atlas (document database)</strong>
              <ul className="list-disc pl-5 mt-1">
                <li>Create a free MongoDB Atlas account</li>
                <li>Set up a new cluster</li>
                <li>Create a database user and whitelist your IP</li>
                <li>Get your connection string</li>
                <li>Add the connection string as an environment variable in Vercel</li>
              </ul>
            </li>
            <li>
              <strong>Option 2: Supabase (PostgreSQL)</strong>
              <ul className="list-disc pl-5 mt-1">
                <li>Create a Supabase account</li>
                <li>Create a new project</li>
                <li>Set up your database tables</li>
                <li>Get your API keys</li>
                <li>Add the API keys as environment variables in Vercel</li>
              </ul>
            </li>
          </ol>
        </div>
      ),
    },
    {
      title: "Troubleshooting",
      icon: AlertCircle,
      content: (
        <div className="space-y-2">
          <p>Common issues and solutions:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>WebSocket connection issues</strong>
              <p className="mt-1">
                Make sure your WebSocket server is running and accessible. Check CORS settings and ensure the client is
                connecting to the correct URL.
              </p>
            </li>
            <li>
              <strong>Environment variables not working</strong>
              <p className="mt-1">
                Verify that you've set up environment variables correctly in Vercel. For local development, use a
                .env.local file.
              </p>
            </li>
            <li>
              <strong>Build errors</strong>
              <p className="mt-1">
                Check Vercel build logs for specific errors. Make sure all dependencies are correctly installed and
                imported.
              </p>
            </li>
            <li>
              <strong>Socket.io version mismatch</strong>
              <p className="mt-1">Ensure client and server are using compatible Socket.io versions.</p>
            </li>
          </ul>
        </div>
      ),
    },
  ]

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="fixed bottom-4 left-4 flex items-center gap-2">
          <Server size={16} />
          Deployment Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server size={18} />
            UNO Game Deployment Guide
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="step-by-step">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="step-by-step">Step-by-Step Guide</TabsTrigger>
            <TabsTrigger value="quick-deploy">Quick Deploy</TabsTrigger>
          </TabsList>

          <TabsContent value="step-by-step" className="space-y-4 pt-4">
            <p className="text-sm text-gray-500">
              Follow these steps to deploy your UNO game to production. Click on each step to expand for detailed
              instructions.
            </p>

            <div className="space-y-2">
              {deploymentSteps.map((step, index) => (
                <Card key={index} className="overflow-hidden">
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => toggleStep(index)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                        <step.icon size={18} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="font-medium">
                        Step {index + 1}: {step.title}
                      </h3>
                    </div>
                    {expandedStep === index ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </div>

                  {expandedStep === index && (
                    <motion.div
                      className="px-4 pb-4 pt-2 border-t"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {step.content}
                    </motion.div>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="quick-deploy" className="space-y-4 pt-4">
            <p className="text-sm text-gray-500">
              For a quicker deployment, you can use the one-click deploy options below.
            </p>

            <div className="space-y-4">
              <Card className="p-4">
                <h3 className="font-medium flex items-center gap-2 mb-3">
                  <Server size={18} className="text-blue-600" />
                  Deploy to Vercel
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  The easiest way to deploy your UNO game is with Vercel. This will automatically set up CI/CD for your
                  project.
                </p>
                <Button className="w-full">Deploy to Vercel</Button>
              </Card>

              <Card className="p-4">
                <h3 className="font-medium flex items-center gap-2 mb-3">
                  <Terminal size={18} className="text-purple-600" />
                  Deploy with CLI
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  If you prefer using the command line, you can deploy with the Vercel CLI.
                </p>
                <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto mb-4">
                  npm i -g vercel
                  <br />
                  vercel login
                  <br />
                  vercel
                </pre>
                <Button variant="outline" className="w-full">
                  Install Vercel CLI
                </Button>
              </Card>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <h3 className="font-medium flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                  <AlertCircle size={18} />
                  Important Note
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                  For the multiplayer functionality to work properly, you'll need to set up a WebSocket server
                  separately. The Socket.io server cannot run directly on Vercel's serverless functions due to their
                  stateless nature. See Step 5 in the Step-by-Step guide for details.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

