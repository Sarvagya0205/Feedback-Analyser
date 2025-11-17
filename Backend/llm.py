from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser, PydanticOutputParser
from langchain_core.runnables import RunnableBranch, RunnableLambda
from pydantic import BaseModel, Field
from typing import Literal
from dotenv import load_dotenv
load_dotenv()

model = ChatOpenAI(model="gpt-5-mini",temperature=1)
parser = StrOutputParser()

class Feedback(BaseModel):
    sentiment: Literal['positive', 'negative', 'neutral'] = Field(description="give the sentiment of the feedback")

parser2 = PydanticOutputParser(pydantic_object=Feedback)

prompt1 = PromptTemplate(
    template='classify the following feedback into positive , negative , neutral {text} \n {format_instruction}',
    input_variables=["text"],
    partial_variables={'format_instruction': parser2.get_format_instructions()}
)

classifier_chain = prompt1 | model | parser2
prompt2 = PromptTemplate(
    template="Write an appropriate response for this positive feedback \n {text}",
    input_variables=["text"]
)
prompt3 = PromptTemplate(
    template="Write an appropriate response for this negative feedback \n {text}",
    input_variables=["text"]
)

branch_chain = RunnableBranch(
    (lambda x: x.sentiment == 'positive', prompt2 | model | parser),
    (lambda x: x.sentiment == 'negative', prompt3 | model | parser),
    RunnableLambda(lambda x: "could not find sentiment")
)
chain = classifier_chain | branch_chain


def analyze_feedback(text: str):
    """Classify feedback text and optionally return model response."""
    classification = classifier_chain.invoke({'text': text})
    # Currently we only need sentiment for API response; feel free to return `result`
    _ = chain.invoke({'text': text})
    return {
        'feedback': text,
        'sentiment': classification.sentiment
    }


# if __name__ == "__main__":
#     # Simple CLI loop for manual testing
#     while True:
#         user_input = input("Enter your feedback (or type 'exit' to stop): ")
#         if user_input.lower() == "exit":
#             break
#         result = analyze_feedback(user_input)
#         print(result)