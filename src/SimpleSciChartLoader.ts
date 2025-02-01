import { Guard, ISciChartLoader, IThemeProvider } from "scichart";

export class SimpleSciChartLoader implements ISciChartLoader {
    private static hasStyles: boolean = false;
    private static sciChartLoaderStylesId: string = "scichart_default_loader_styles_id";
    type = "Default";
    /**
     * @inheritDoc
     */
    public addChartLoader(domChartRoot: HTMLDivElement, theme: IThemeProvider): HTMLElement {
        this.addLoaderStyles();
        Guard.notNull(domChartRoot, "domDivContainer");
        Guard.notNull(theme, "theme");

        const loaderContainerDiv = document.createElement("div");
        loaderContainerDiv.style.background = theme.loadingAnimationBackground;
        loaderContainerDiv.style.height = "100%";
        loaderContainerDiv.style.width = "100%";
        loaderContainerDiv.style.display = "flex";
        loaderContainerDiv.style.justifyContent = "center";
        loaderContainerDiv.style.alignItems = "center";
        loaderContainerDiv.style.position = "relative";
        loaderContainerDiv.style.zIndex = "11";

        const loaderDiv = document.createElement("div");
        loaderDiv.classList.add("scichart-loader");

        loaderContainerDiv.appendChild(loaderDiv);
        domChartRoot.appendChild(loaderContainerDiv);

        return loaderContainerDiv;
    }
    /**
     * @inheritDoc
     */
    public removeChartLoader(domChartRoot: HTMLDivElement, loaderElement: HTMLElement): void {
        try {
            domChartRoot.removeChild(loaderElement);
        } catch (err) {
            console.error(err);
        }
    }

    public toJSON() {
        return { type: this.type };
    }

    private addLoaderStyles(): void {
        if (SimpleSciChartLoader.hasStyles) {
            return;
        }

        const head = document.head;
        const style = document.createElement("style");
        style.id = SimpleSciChartLoader.sciChartLoaderStylesId;
        head.appendChild(style);
        style.appendChild(document.createTextNode(loaderCss));
        SimpleSciChartLoader.hasStyles = true;
    }
}

const loaderCss = `
.scichart-loader {
  border: 4px solid rgba(0, 0, 0, .1);
  border-left-color: transparent;
  border-radius: 50%;
}

.scichart-loader {
  border: 4px solid rgba(0, 0, 0, .1);
  border-left-color: transparent;
  width: 24px;
  height: 24px;
}

.scichart-loader {
  border: 4px solid rgba(0, 0, 0, .1);
  border-left-color: transparent;
  width: 24px;
  height: 24px;
  animation: spin89345 1s linear infinite;
}

@keyframes spin89345 {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
`