import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Download, Share } from 'lucide-react';
import APIService from '@/lib/api';
import jsPDF from 'jspdf';

interface ReportData {
  totalTests: number;
  averageFormScore: number;
  testResults: Array<{
    testType: string;
    formScore: number;
    badge: string;
    recommendations: string[];
    metrics: Record<string, any>;
    timestamp: number;
  }>;
  overallRecommendations: string[];
  strengthAreas: string[];
  improvementAreas: string[];
}

export function ComprehensiveReport() {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const loadTestData = async () => {
    try {
      const user = await APIService.getCurrentUser();
      if (user) {
        const data = await APIService.getTestHistory(user.id, 50);
        setAttempts(data || []);
      }
    } catch (error) {
      console.error('Failed to load test data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadTestData();
    
    const handleTestCompleted = () => {
      console.log('Test completed, refreshing comprehensive report...');
      setTimeout(loadTestData, 1000);
    };
    
    window.addEventListener('testCompleted', handleTestCompleted);
    return () => window.removeEventListener('testCompleted', handleTestCompleted);
  }, []);
  
  const generateReport = (): ReportData => {
    // Filter only advanced-analyzed tests from database
    const realTests = attempts.filter(attempt => 
      attempt.formScore && 
      attempt.formScore > 0 && 
      attempt.recommendations && 
      attempt.recommendations.length > 0
    );
    
    const testResults = realTests.map(attempt => ({
      testType: attempt.testType,
      formScore: attempt.formScore,
      badge: attempt.badge || 'Good',
      recommendations: attempt.recommendations || [],
      metrics: attempt.metrics || {},
      timestamp: new Date(attempt.createdAt).getTime()
    }));

    const totalFormScore = testResults.reduce((sum, test) => sum + test.formScore, 0);
    const averageFormScore = testResults.length > 0 ? Math.round(totalFormScore / testResults.length) : 0;

    // Analyze strengths and improvements
    const highScoreTests = testResults.filter(t => t.formScore >= 80);
    const lowScoreTests = testResults.filter(t => t.formScore < 70);

    const strengthAreas = highScoreTests.map(t => formatTestName(t.testType));
    const improvementAreas = lowScoreTests.map(t => formatTestName(t.testType));

    // Compile overall recommendations
    const allRecommendations = testResults.flatMap(t => t.recommendations);
    const uniqueRecommendations = [...new Set(allRecommendations)].slice(0, 5);

    return {
      totalTests: testResults.length,
      averageFormScore,
      testResults,
      overallRecommendations: uniqueRecommendations,
      strengthAreas,
      improvementAreas
    };
  };

  const formatTestName = (testType: string): string => {
    const names: Record<string, string> = {
      verticalJump: 'Vertical Jump',
      sitUps: 'Sit-ups',
      pushUps: 'Push-ups',
      pullUps: 'Pull-ups',
      shuttleRun: 'Shuttle Run',
      enduranceRun: 'Endurance Run',
      flexibilityTest: 'Flexibility Test',
      agilityLadder: 'Agility Ladder',
      heightWeight: 'Height/Weight'
    };
    return names[testType] || testType;
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'National Standard': return 'bg-gold-500';
      case 'State Level': return 'bg-blue-500';
      case 'District Elite': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const report = generateReport();

  const downloadReport = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPosition = 20;
    
    // Title
    pdf.setFontSize(20);
    pdf.text('AthletiX Performance Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;
    
    // Date
    pdf.setFontSize(10);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;
    
    // Summary
    pdf.setFontSize(14);
    pdf.text('Performance Summary', 20, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(10);
    pdf.text(`Tests Completed: ${report.totalTests}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Average Form Score: ${report.averageFormScore}/100`, 20, yPosition);
    yPosition += 15;
    
    // Test Results
    pdf.setFontSize(14);
    pdf.text('Test Results', 20, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(10);
    report.testResults.forEach((test, index) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(`${formatTestName(test.testType)}: ${test.formScore}/100 (${test.badge})`, 20, yPosition);
      yPosition += 8;
    });
    
    // Recommendations
    if (report.overallRecommendations.length > 0) {
      yPosition += 10;
      if (yPosition > 240) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(14);
      pdf.text('Expert Recommendations', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(10);
      report.overallRecommendations.forEach((rec, index) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
        const lines = pdf.splitTextToSize(`• ${rec}`, pageWidth - 40);
        pdf.text(lines, 20, yPosition);
        yPosition += lines.length * 6;
      });
    }
    
    // Save PDF
    pdf.save(`athletix-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const shareReport = () => {
    const summary = `AthletiX Performance Report\n\nTests Completed: ${report.totalTests}\nAverage Form Score: ${report.averageFormScore}/100\n\nStrength Areas: ${report.strengthAreas.join(', ')}\nImprovement Areas: ${report.improvementAreas.join(', ')}`;
    
    if (navigator.share) {
      navigator.share({ title: 'AthletiX Performance Report', text: summary });
    } else {
      navigator.clipboard.writeText(summary);
      alert('Report summary copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Loading your test data...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (report.totalTests === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No advanced test data available. Complete some tests with performance analysis to generate your comprehensive report.</p>
          <p className="text-sm text-muted-foreground mt-2">Go to Tests page and record videos for performance analysis.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Comprehensive Performance Report</span>
            <div className="flex gap-2">
              <Button onClick={shareReport} variant="outline" size="sm" className="gap-2">
                <Share className="h-4 w-4" /> Share
              </Button>
              <Button onClick={downloadReport} variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" /> Download
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold text-brand-500">{report.totalTests}</div>
              <div className="text-sm text-muted-foreground">Tests Completed</div>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold text-brand-500">{report.averageFormScore}</div>
              <div className="text-sm text-muted-foreground">Average Form Score</div>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <Progress value={report.averageFormScore} className="mb-2" />
              <div className="text-sm text-muted-foreground">Overall Performance</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Results Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {report.testResults.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="font-medium">{formatTestName(test.testType)}</div>
                  <Badge className={getBadgeColor(test.badge)}>{test.badge}</Badge>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{test.formScore}/100</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(test.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {report.strengthAreas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Strength Areas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {report.strengthAreas.map((area, index) => (
                <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                  {area}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {report.improvementAreas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-600">Areas for Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {report.improvementAreas.map((area, index) => (
                <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800">
                  {area}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {report.overallRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Expert Recommendations Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.overallRecommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}