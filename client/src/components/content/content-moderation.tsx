import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Lightbulb, 
  Leaf, 
  Globe,
  Info
} from "lucide-react";
import { 
  validateContent, 
  filterPostContent, 
  getContentCategoryDisplay, 
  getContentQualityScore,
  getAgricultureSuggestions,
  getEnvironmentSuggestions,
  type ContentValidationResult 
} from "@/utils/content-moderation";

interface ContentModerationProps {
  content: string;
  onValidationChange: (isValid: boolean) => void;
  showSuggestions?: boolean;
}

export default function ContentModeration({ 
  content, 
  onValidationChange, 
  showSuggestions = true 
}: ContentModerationProps) {
  const [validation, setValidation] = useState<ContentValidationResult | null>(null);
  const [qualityScore, setQualityScore] = useState(0);
  const [showAgricultureSuggestions, setShowAgricultureSuggestions] = useState(false);
  const [showEnvironmentSuggestions, setShowEnvironmentSuggestions] = useState(false);

  useEffect(() => {
    if (content.trim().length > 0) {
      const result = filterPostContent(content);
      setValidation(result);
      setQualityScore(getContentQualityScore(content));
      onValidationChange(result.isValid);
    } else {
      setValidation(null);
      setQualityScore(0);
      onValidationChange(false);
    }
  }, [content, onValidationChange]);

  if (!validation || content.trim().length === 0) {
    return null;
  }

  const getValidationIcon = () => {
    if (validation.isValid) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getValidationColor = () => {
    if (validation.isValid) {
      return "border-green-200 bg-green-50";
    }
    return "border-red-200 bg-red-50";
  };

  const getQualityColor = () => {
    if (qualityScore >= 80) return "text-green-600";
    if (qualityScore >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getQualityLabel = () => {
    if (qualityScore >= 80) return "Excellent";
    if (qualityScore >= 60) return "Good";
    if (qualityScore >= 40) return "Fair";
    return "Poor";
  };

  return (
    <div className="space-y-3">
      {/* Content Validation Alert */}
      <Alert className={getValidationColor()}>
        {getValidationIcon()}
        <AlertDescription className="flex items-center justify-between">
          <span className="font-medium">
            {validation.isValid ? "Content Approved!" : "Content Needs Attention"}
          </span>
          <Badge variant={validation.isValid ? "default" : "destructive"}>
            {getContentCategoryDisplay(validation.category || 'unrelated')}
          </Badge>
        </AlertDescription>
      </Alert>

      {/* Content Quality Score */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center space-x-2">
            <Info className="h-4 w-4" />
            <span>Content Quality Score</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className={getQualityColor()}>
              {getQualityLabel()} ({qualityScore}/100)
            </span>
            <span className="text-muted-foreground">
              {validation.confidence}% relevant
            </span>
          </div>
          <Progress value={qualityScore} className="h-2" />
        </CardContent>
      </Card>

      {/* Validation Details */}
      {!validation.isValid && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-800 flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Why this content was flagged:</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-red-700">
              {validation.reason}
            </p>
            
            {validation.suggestions && (
              <div>
                <p className="text-sm font-medium text-red-800 mb-2">Suggestions:</p>
                <ul className="space-y-1">
                  {validation.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-red-700 flex items-start space-x-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Content Suggestions */}
      {showSuggestions && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Lightbulb className="h-4 w-4" />
              <span>Content Ideas</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Agriculture Suggestions */}
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAgricultureSuggestions(!showAgricultureSuggestions)}
                className="w-full justify-start"
              >
                <Leaf className="h-4 w-4 mr-2" />
                Agriculture & Gardening Ideas
              </Button>
              
              {showAgricultureSuggestions && (
                <div className="mt-2 space-y-2">
                  {getAgricultureSuggestions().slice(0, 3).map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800 cursor-pointer hover:bg-green-100 transition-colors"
                      onClick={() => {
                        // This would be handled by the parent component
                        console.log('Suggestion clicked:', suggestion);
                      }}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Environment Suggestions */}
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEnvironmentSuggestions(!showEnvironmentSuggestions)}
                className="w-full justify-start"
              >
                <Globe className="h-4 w-4 mr-2" />
                Environment & Sustainability Ideas
              </Button>
              
              {showEnvironmentSuggestions && (
                <div className="mt-2 space-y-2">
                  {getEnvironmentSuggestions().slice(0, 3).map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800 cursor-pointer hover:bg-blue-100 transition-colors"
                      onClick={() => {
                        // This would be handled by the parent component
                        console.log('Suggestion clicked:', suggestion);
                      }}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Guidelines */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-blue-800 flex items-center space-x-2">
            <Info className="h-4 w-4" />
            <span>Content Guidelines</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-xs text-blue-700 space-y-1">
            <p>✅ <strong>Share:</strong> Plant care, gardening tips, farming experiences</p>
            <p>✅ <strong>Discuss:</strong> Environmental issues, sustainability, conservation</p>
            <p>✅ <strong>Post about:</strong> Wildlife, ecosystems, natural resources</p>
            <p>❌ <strong>Avoid:</strong> Politics, entertainment, sports, personal drama</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
