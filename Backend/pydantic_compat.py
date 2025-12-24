"""
Pydantic v1 compatibility patch for newer Python versions.
This fixes the ForwardRef._evaluate() missing recursive_guard argument error.
"""
import sys
from typing import ForwardRef

# Patch ForwardRef._evaluate to handle the recursive_guard parameter
original_evaluate = ForwardRef._evaluate

def patched_evaluate(self, globalns, localns, recursive_guard=None):
    """Patched version that handles recursive_guard parameter"""
    if recursive_guard is None:
        recursive_guard = set()
    return original_evaluate(self, globalns, localns, recursive_guard)

# Apply the patch
ForwardRef._evaluate = patched_evaluate
