"use client";
import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean; message: string };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, message: error instanceof Error ? error.message : "Something went wrong." };
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Tool crashed:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass-card rounded-3xl p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-2xl">⚠️</div>
          <h3 className="mt-4 text-lg font-semibold">This file tripped up the tool</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-secondary">
            The PDF may be corrupted, encrypted, or in an unexpected format. {this.state.message}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, message: "" })}
            className="mt-5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2 text-sm font-semibold text-white shadow-md"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
